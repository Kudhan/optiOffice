import asyncio
import sys
import os
from datetime import datetime, timedelta
import random

# Add current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from app.db.mongodb import database
from app.core.security import get_password_hash
from app.crud.user import create_user, get_user_by_username
from app.crud.asset import create_asset
from app.crud.attendance import create_attendance
from app.crud.leave import create_leave
from app.crud.task import create_task
from app.crud.holiday import create_holiday
from app.crud.policy import update_system_policy

async def populate():
    print("🌱 Starting database population...")

    # --- 1. Policies ---
    print("📜 Setting up policies...")
    await update_system_policy({
        "password_policy": {"min_length": 6},
        "attendance_policy": {"office_start_time": "09:00", "grace_period_minutes": 30},
        "leave_policy": {"annual_leave_quota": 20, "sick_leave_quota": 10},
        "customization_policy": {"company_name": "TechNova Solutions", "primary_color": "#4f46e5"}
    })

    # --- 2. Users ---
    print("bust👥 Creating users...")
    users_data = [
        # Admin
        {"username": "admin", "full_name": "System Admin", "email": "admin@technova.com", "role": "admin", "designation": "CTO", "department": "Management"},
        
        # Managers
        {"username": "sarah_manager", "full_name": "Sarah Connor", "email": "sarah@technova.com", "role": "manager", "designation": "Engineering Manager", "department": "Engineering"},
        {"username": "mike_manager", "full_name": "Mike Ross", "email": "mike@technova.com", "role": "manager", "designation": "Sales Director", "department": "Sales"},
        
        # Engineering Team (Reports to Sarah)
        {"username": "john_dev", "full_name": "John Doe", "email": "john@technova.com", "role": "employee", "designation": "Senior Backend Dev", "department": "Engineering", "manager_id": "sarah_manager"},
        {"username": "jane_dev", "full_name": "Jane Smith", "email": "jane@technova.com", "role": "employee", "designation": "Frontend Developer", "department": "Engineering", "manager_id": "sarah_manager"},
        {"username": "alex_design", "full_name": "Alex Murphy", "email": "alex@technova.com", "role": "employee", "designation": "UI/UX Designer", "department": "Design", "manager_id": "sarah_manager"},
        
        # Sales Team (Reports to Mike)
        {"username": "emily_sales", "full_name": "Emily Blunt", "email": "emily@technova.com", "role": "employee", "designation": "Sales Executive", "department": "Sales", "manager_id": "mike_manager"},
        {"username": "chris_sales", "full_name": "Chris Evans", "email": "chris@technova.com", "role": "employee", "designation": "Account Manager", "department": "Sales", "manager_id": "mike_manager"},
    ]

    created_users = []
    for u in users_data:
        existing = await get_user_by_username(u["username"])
        if not existing:
            u["hashed_password"] = get_password_hash("password123") # Default password
            u["status"] = "Active"
            u["joining_date"] = (datetime.now() - timedelta(days=random.randint(30, 365*2))).strftime("%Y-%m-%d")
            u["phone"] = f"+1 555 01{random.randint(10, 99)}"
            await create_user(u)
            print(f"   Created user: {u['username']}")
            created_users.append(u["username"])
        else:
            print(f"   User {u['username']} already exists")
            created_users.append(u["username"])

    # --- 3. Assets ---
    print("💻 Assigning assets...")
    assets_data = [
        {"name": "MacBook Pro 16", "type": "Laptop", "serial_number": "MBP-2023-001", "assigned_to": "john_dev", "status": "Assigned"},
        {"name": "Dell XPS 15", "type": "Laptop", "serial_number": "DELL-2023-042", "assigned_to": "jane_dev", "status": "Assigned"},
        {"name": "iMac 27 5K", "type": "Monitor", "serial_number": "APP-DISP-99", "assigned_to": "alex_design", "status": "Assigned"},
        {"name": "ThinkPad X1", "type": "Laptop", "serial_number": "LEN-TP-88", "assigned_to": "sarah_manager", "status": "Assigned"},
        {"name": "iPad Pro", "type": "Tablet", "serial_number": "IPAD-22-11", "assigned_to": "mike_manager", "status": "Assigned"},
        {"name": "Office Key #101", "type": "Key", "serial_number": "KEY-101", "assigned_to": "admin", "status": "Assigned"},
        {"name": "Spare Monitor LG", "type": "Monitor", "serial_number": "LG-27-UL", "assigned_to": None, "status": "Available"},
        {"name": "Projector Epson", "type": "Equipment", "serial_number": "EPS-PROJ-1", "assigned_to": None, "status": "Maintenance"},
    ]
    
    # Clear existing assets to avoid dupes logic complexity for this script
    await database.get_collection("assets_collection").delete_many({})
    for asset in assets_data:
        await create_asset(asset)
    print(f"   Added {len(assets_data)} assets.")

    # --- 4. Attendance (Last 7 days) ---
    print("⏱️ Generating attendance records...")
    await database.get_collection("attendance_collection").delete_many({})
    
    today = datetime.now()
    for i in range(7):
        date = today - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Skip weekends
        if date.weekday() >= 5: 
            continue

        for username in created_users:
            # Randomize check-in times
            hour = random.randint(8, 10)
            minute = random.randint(0, 59)
            check_in = datetime(date.year, date.month, date.day, hour, minute)
            
            # 90% chance of being present
            if random.random() > 0.1:
                # 10% chance of forgetting checkout
                check_out = None
                if random.random() > 0.1:
                    check_out = check_in + timedelta(hours=random.uniform(8, 10))
                
                status = "Present"
                if hour > 9 or (hour == 9 and minute > 30): # Late after 9:30
                    status = "Late"

                await create_attendance({
                    "username": username,
                    "date": date_str,
                    "check_in": check_in,
                    "check_out": check_out,
                    "status": status
                })
    print("   Attendance records generated.")

    # --- 5. Tasks ---
    print("✅ Creating tasks...")
    await database.get_collection("tasks_collection").delete_many({})
    tasks_data = [
        {"title": "Q4 Roadmap Planning", "description": "Draft the initial roadmap for Q4 engineering goals.", "assigned_to": "sarah_manager", "status": "In Progress", "priority": "High", "due_date": (today + timedelta(days=5)).strftime("%Y-%m-%d")},
        {"title": "Fix API Latency", "description": "Investigate slow response times on /users endpoint.", "assigned_to": "john_dev", "status": "To Do", "priority": "High", "due_date": (today + timedelta(days=2)).strftime("%Y-%m-%d")},
        {"title": "Update Landing Page", "description": "Implement new hero section design.", "assigned_to": "jane_dev", "status": "Done", "priority": "Medium", "due_date": (today - timedelta(days=1)).strftime("%Y-%m-%d")},
        {"title": "Design System Audit", "description": "Review current components for consistency.", "assigned_to": "alex_design", "status": "In Progress", "priority": "Low", "due_date": (today + timedelta(days=10)).strftime("%Y-%m-%d")},
        {"title": "Client Outreach", "description": "Contact 50 potential leads from the conference.", "assigned_to": "emily_sales", "status": "To Do", "priority": "High", "due_date": (today + timedelta(days=3)).strftime("%Y-%m-%d")},
        {"title": "Prepare Monthly Invoice", "description": "Generate invoices for enterprise clients.", "assigned_to": "chris_sales", "status": "Done", "priority": "Medium", "due_date": (today - timedelta(days=5)).strftime("%Y-%m-%d")},
    ]
    for task in tasks_data:
        await create_task(task)
    print(f"   Added {len(tasks_data)} tasks.")

    # --- 6. Leaves ---
    print("🏖️ Applying leaves...")
    await database.get_collection("leaves_collection").delete_many({})
    leaves_data = [
        {"username": "john_dev", "type": "Sick", "start_date": (today - timedelta(days=10)).strftime("%Y-%m-%d"), "end_date": (today - timedelta(days=9)).strftime("%Y-%m-%d"), "reason": "Flu", "status": "Approved"},
        {"username": "jane_dev", "type": "Annual", "start_date": (today + timedelta(days=20)).strftime("%Y-%m-%d"), "end_date": (today + timedelta(days=25)).strftime("%Y-%m-%d"), "reason": "Vacation", "status": "Pending"},
        {"username": "alex_design", "type": "Casual", "start_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"), "end_date": (today + timedelta(days=1)).strftime("%Y-%m-%d"), "reason": "Personal work", "status": "Rejected", "rejection_reason": "Urgent deadline"},
    ]
    for leave in leaves_data:
        await create_leave(leave)
    print(f"   Added {len(leaves_data)} leave requests.")

    # --- 7. Holidays ---
    print("🎉 Setting holidays...")
    # (Already handled in main.py startup, but let's ensure a few more)
    holidays_data = [
        {"name": "Thanksgiving", "date": "2024-11-28", "type": "Public", "description": "Harvest festival"},
        {"name": "Company Anniversary", "date": "2024-08-15", "type": "Optional", "description": "5 years of TechNova"},
    ]
    for h in holidays_data:
        # Simple check to avoid dupes if running multiple times
        existing = await database.get_collection("holidays_collection").find_one({"name": h["name"]})
        if not existing:
            await create_holiday(h)
    print("   Holidays updated.")

    print("\n✨ Database population complete! You can now log in with:")
    print("   Admin: admin / password123")
    print("   Manager: sarah_manager / password123")
    print("   Employee: john_dev / password123")

if __name__ == "__main__":
    asyncio.run(populate())
