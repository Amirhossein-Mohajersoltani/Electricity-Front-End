#!/usr/bin/env python3
"""
🚀 Automated Server Deployment Script
Automatic deployment to server without internet access
"""

import subprocess
import os
import sys
import platform
from pathlib import Path
import json
import shutil
import time

class ServerDeployer:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.backend_dir = self.project_root / "backend"
        self.frontend_dir = self.project_root / "frontend"
        
        # Server settings (change these)
        self.server_user = "sadjad"  # Server username
        self.server_host = "178.236.33.157"  # Server IP
        self.remote_path = "/home/sadjad"  # Path on server
        
        self.temp_dir = self.project_root / "temp_deploy"
        self.current_step = 0
        self.total_steps = 6
        
    def print_step(self, step, description):
        self.current_step = step
        print(f"\n{'='*70}")
        print(f"📋 STEP {step}/{self.total_steps}: {description}")
        print(f"{'='*70}")
        
    def print_substep(self, description):
        print(f"  ├─ {description}")
        
    def print_progress(self, message):
        print(f"  │  {message}")
        
    def print_success(self, message):
        print(f"  ✅ {message}")
        
    def print_error(self, message):
        print(f"  ❌ {message}")
        
    def print_warning(self, message):
        print(f"  ⚠️  {message}")
        
    def run_command(self, command, cwd=None, shell=True, timeout=300):
        """Execute command with error handling and better logging"""
        try:
            self.print_progress(f"Running: {command[:80]}...")
            
            result = subprocess.run(
                command, 
                shell=shell, 
                cwd=cwd, 
                capture_output=True, 
                text=True,
                encoding='utf-8',
                timeout=timeout
            )
            
            if result.returncode == 0:
                self.print_success("Command completed successfully")
                if result.stdout and len(result.stdout) < 300:
                    self.print_progress(f"Output: {result.stdout.strip()}")
                return True
            else:
                self.print_error(f"Command failed with return code: {result.returncode}")
                if result.stderr:
                    self.print_error(f"Error: {result.stderr[:500]}")
                if result.stdout:
                    self.print_progress(f"Output: {result.stdout[:500]}")
                return False
                
        except subprocess.TimeoutExpired:
            self.print_error(f"Command timed out after {timeout} seconds")
            return False
        except Exception as e:
            self.print_error(f"Exception occurred: {str(e)}")
            return False
    
    def setup_temp_directory(self):
        """Create temporary directory for file preparation"""
        self.print_step(1, "Setting up temporary directory")
        
        self.print_substep("Checking existing temp directory...")
        if self.temp_dir.exists():
            self.print_progress("Removing existing temp directory...")
            try:
                shutil.rmtree(self.temp_dir)
                self.print_success("Old temp directory removed")
            except Exception as e:
                self.print_error(f"Failed to remove old temp directory: {e}")
                return False
        
        self.print_substep("Creating new temp directory...")
        try:
            self.temp_dir.mkdir()
            self.print_success(f"Temporary directory created: {self.temp_dir}")
            return True
        except Exception as e:
            self.print_error(f"Failed to create temp directory: {e}")
            return False
    
    def prepare_backend(self):
        """Prepare Backend with dependencies"""
        self.print_step(2, "Preparing Backend")
        
        backend_temp = self.temp_dir / "backend"
        
        # Copy backend files
        self.print_substep("Copying backend files...")
        try:
            shutil.copytree(self.backend_dir, backend_temp, 
                           ignore=shutil.ignore_patterns('venv', '__pycache__', '*.pyc', '*.log'))
            self.print_success("Backend files copied successfully")
        except Exception as e:
            self.print_error(f"Failed to copy backend files: {e}")
            return False
        
        # Create virtual environment
        self.print_substep("Creating virtual environment...")
        venv_path = backend_temp / "venv"
        
        if not self.run_command(f"python -m venv {venv_path}", timeout=60):
            self.print_error("Failed to create virtual environment")
            return False
        
        # Activate venv and install dependencies
        self.print_substep("Installing Python dependencies...")
        if platform.system() == "Windows":
            activate_cmd = f'"{venv_path}\\Scripts\\activate" && pip install --no-cache-dir -r requirements.txt'
            python_exe = venv_path / "Scripts" / "python.exe"
        else:
            activate_cmd = f"source {venv_path}/bin/activate && pip install --no-cache-dir -r requirements.txt"
            python_exe = venv_path / "bin" / "python"
        
        if not self.run_command(activate_cmd, cwd=backend_temp, timeout=300):
            self.print_error("Failed to install Python dependencies")
            return False
        
        # Create freeze requirements file
        self.print_substep("Creating requirements freeze file...")
        freeze_cmd = f'"{python_exe}" -m pip freeze > requirements_installed.txt'
        self.run_command(freeze_cmd, cwd=backend_temp)
        
        self.print_success("Backend preparation completed")
        return True
    
    def prepare_frontend(self):
        """Prepare Frontend"""
        self.print_step(3, "Preparing Frontend")
        
        frontend_temp = self.temp_dir / "frontend"
        
        # Copy frontend files
        self.print_substep("Copying frontend files...")
        try:
            shutil.copytree(self.frontend_dir, frontend_temp,
                           ignore=shutil.ignore_patterns('node_modules', 'dist', '.next', '.cache'))
            self.print_success("Frontend files copied successfully")
        except Exception as e:
            self.print_error(f"Failed to copy frontend files: {e}")
            return False
        
        # Check if package.json exists
        package_json = frontend_temp / "package.json"
        if not package_json.exists():
            self.print_error("package.json not found in frontend directory")
            return False
        
        # Try npm install with retries
        self.print_substep("Installing npm dependencies...")
        
        # Clean npm cache first
        self.print_progress("Cleaning npm cache...")
        self.run_command("npm cache clean --force", cwd=frontend_temp, timeout=60)
        
        # Try different npm install strategies
        install_commands = [
            "npm install --no-optional --prefer-offline",
            "npm install --legacy-peer-deps",
            "npm install --force",
            "npm ci --prefer-offline"
        ]
        
        success = False
        for i, cmd in enumerate(install_commands, 1):
            self.print_progress(f"Attempt {i}/{len(install_commands)}: {cmd}")
            
            if self.run_command(cmd, cwd=frontend_temp, timeout=600):
                success = True
                break
            else:
                self.print_warning(f"Attempt {i} failed, trying next method...")
                time.sleep(2)
        
        if not success:
            self.print_error("All npm install attempts failed")
            self.print_warning("You can manually run 'npm install' in the temp_deploy/frontend directory")
            
            # Ask user if they want to continue without building
            response = input("\n❓ Continue without building frontend? (y/n): ")
            if response.lower() not in ['y', 'yes']:
                return False
            else:
                self.print_warning("Skipping frontend build - you'll need to build manually")
                return True
        
        # Build production
        self.print_substep("Building production...")
        if not self.run_command("npm run build", cwd=frontend_temp, timeout=300):
            self.print_error("Failed to build frontend")
            
            # Ask user if they want to continue
            response = input("\n❓ Continue without frontend build? (y/n): ")
            if response.lower() not in ['y', 'yes']:
                return False
            else:
                self.print_warning("Continuing without frontend build")
        
        self.print_success("Frontend preparation completed")
        return True
    
    def create_transfer_script(self):
        """Create transfer script"""
        self.print_step(4, "Creating Transfer Script")
        
        self.print_substep("Generating transfer script...")
        
        transfer_script = f"""#!/bin/bash
# Auto-generated transfer script

SERVER="{self.server_user}@{self.server_host}"
REMOTE_PATH="{self.remote_path}"

echo "🚀 Starting file transfer to server..."

# Stop services
echo "🛑 Stopping services..."
ssh $SERVER "sudo systemctl stop electricity-backend || echo 'Service not found'"

# Backup old files
echo "💾 Backing up old files..."
ssh $SERVER "cd $REMOTE_PATH && cp -r backend backend_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'No old backend to backup'"
ssh $SERVER "cd $REMOTE_PATH && cp -r frontend frontend_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo 'No old frontend to backup'"

# Transfer Backend
echo "🔧 Transferring Backend..."
rsync -av --delete backend/ $SERVER:$REMOTE_PATH/backend/

# Transfer Frontend (dist only if exists, otherwise all)
echo "🌐 Transferring Frontend..."
if [ -d "frontend/dist" ]; then
    rsync -av --delete frontend/dist/ $SERVER:$REMOTE_PATH/frontend/dist/
else
    echo "⚠️  No dist folder found, transferring source files..."
    rsync -av --exclude 'node_modules' frontend/ $SERVER:$REMOTE_PATH/frontend/
fi

# Set permissions
echo "🔐 Setting permissions..."
ssh $SERVER "chmod +x $REMOTE_PATH/backend/venv/bin/* 2>/dev/null || echo 'Setting permissions...'"
ssh $SERVER "chown -R {self.server_user}:{self.server_user} $REMOTE_PATH/backend $REMOTE_PATH/frontend"

# Restart services
echo "🚀 Restarting services..."
ssh $SERVER "sudo systemctl start electricity-backend"
ssh $SERVER "sudo systemctl reload nginx"

# Check status
echo "🔍 Checking status..."
ssh $SERVER "sudo systemctl status electricity-backend --no-pager -l"

echo "✅ Deployment completed!"
echo "🌐 Check website: curl http://localhost:5000/api/health"
"""
        
        script_path = self.temp_dir / "transfer.sh"
        try:
            with open(script_path, "w", encoding="utf-8") as f:
                f.write(transfer_script)
            
            os.chmod(script_path, 0o755)
            self.print_success(f"Transfer script created: {script_path}")
            return True
        except Exception as e:
            self.print_error(f"Failed to create transfer script: {e}")
            return False
    
    def create_server_setup_script(self):
        """Create server setup script"""
        self.print_step(5, "Creating Server Setup Script")
        
        self.print_substep("Generating server setup script...")
        
        setup_script = f"""#!/bin/bash
# Server setup script - run on server

cd {self.remote_path}

echo "🔧 Setting up Backend..."

# Setup environment
if [ ! -f backend/.env ]; then
    echo "⚠️ .env file not found, creating..."
    cat > backend/.env << 'EOF'
FLASK_ENV=production
FLASK_DEBUG=False
FLASK_PORT=5000
FLASK_HOST=0.0.0.0
SECRET_KEY=change-this-secret-key

DB_HOST=localhost
DB_PORT=3306
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=electrodata

FRONTEND_URL=http://your-domain.com
ANALYSIS_API_HOST=127.0.0.1
ANALYSIS_API_PORT=8000
EOF
    echo "⚠️ Please edit the backend/.env file"
fi

# Set permissions
chmod +x backend/venv/bin/* 2>/dev/null || echo "Setting permissions..."
chown -R {self.server_user}:{self.server_user} backend frontend

# Test backend
echo "🧪 Testing Backend..."
cd backend
timeout 5 venv/bin/python main.py &
PID=$!
sleep 3
kill $PID 2>/dev/null
cd ..

echo "✅ Server setup completed"
echo "🚀 To start:"
echo "sudo systemctl start electricity-backend"
echo "sudo systemctl status electricity-backend"
"""
        
        setup_path = self.temp_dir / "server_setup.sh"
        try:
            with open(setup_path, "w", encoding="utf-8") as f:
                f.write(setup_script)
            
            os.chmod(setup_path, 0o755)
            self.print_success(f"Server setup script created: {setup_path}")
            return True
        except Exception as e:
            self.print_error(f"Failed to create server setup script: {e}")
            return False
    
    def create_deployment_info(self):
        """Create deployment information file"""
        self.print_step(6, "Creating deployment information")
        
        self.print_substep("Generating deployment info...")
        
        deployment_info = {
            "deployment_date": time.strftime("%Y-%m-%d %H:%M:%S"),
            "server": f"{self.server_user}@{self.server_host}",
            "remote_path": self.remote_path,
            "components": ["backend", "frontend"],
            "excluded": ["api - existing file will be preserved"],
            "commands": {
                "transfer": "./transfer.sh",
                "server_setup": f"scp server_setup.sh {self.server_user}@{self.server_host}:{self.remote_path}/ && ssh {self.server_user}@{self.server_host} 'cd {self.remote_path} && ./server_setup.sh'",
                "status_check": f"ssh {self.server_user}@{self.server_host} 'sudo systemctl status electricity-backend'"
            },
            "notes": [
                "Backend prepared with complete virtual environment",
                "Frontend built for production (if npm install succeeded)",
                "All dependencies included, no internet required on server",
                "Automatic backup of existing files",
                "API directory preserved on server"
            ]
        }
        
        info_path = self.temp_dir / "deployment_info.json"
        try:
            with open(info_path, "w", encoding="utf-8") as f:
                json.dump(deployment_info, f, indent=2, ensure_ascii=False)
            
            self.print_success(f"Deployment info created: {info_path}")
            return True
        except Exception as e:
            self.print_error(f"Failed to create deployment info: {e}")
            return False
    
    def run_full_deployment(self):
        """Run complete deployment preparation"""
        print("🚀 Starting deployment preparation...")
        print(f"🎯 Target server: {self.server_user}@{self.server_host}:{self.remote_path}")
        print("📝 Note: API file on server will remain untouched")
        
        steps = [
            ("setup_temp_directory", "Setting up workspace"),
            ("prepare_backend", "Preparing Python backend"),
            ("prepare_frontend", "Preparing React frontend"),
            ("create_transfer_script", "Creating transfer automation"),
            ("create_server_setup_script", "Creating server setup"),
            ("create_deployment_info", "Finalizing deployment package")
        ]
        
        failed_steps = []
        
        for step_func, step_desc in steps:
            try:
                method = getattr(self, step_func)
                if not method():
                    self.print_error(f"Failed: {step_desc}")
                    failed_steps.append(step_desc)
                    
                    # Ask if user wants to continue
                    if step_func in ["prepare_frontend"]:  # Allow continuing without frontend
                        response = input(f"\n❓ Continue despite {step_desc} failure? (y/n): ")
                        if response.lower() not in ['y', 'yes']:
                            break
                    else:
                        break
                        
            except Exception as e:
                self.print_error(f"Exception in {step_desc}: {str(e)}")
                failed_steps.append(step_desc)
                break
        
        # Summary
        print(f"\n{'='*70}")
        if not failed_steps:
            print("🎉 Deployment preparation completed successfully!")
        else:
            print("⚠️  Deployment preparation completed with some issues:")
            for step in failed_steps:
                print(f"  ❌ {step}")
        
        print(f"\n📁 Files located in: {self.temp_dir}")
        print("\n🚀 Next steps:")
        print(f"1. Review files in: {self.temp_dir}")
        print(f"2. Run transfer: cd {self.temp_dir} && ./transfer.sh")
        print(f"3. Setup server: ssh {self.server_user}@{self.server_host}")
        print("\n📋 Generated files:")
        print("  - backend/ (with complete venv)")
        print("  - frontend/ (with built files if successful)")
        print("  - transfer.sh (automatic transfer)")
        print("  - server_setup.sh (server configuration)")
        print("  - deployment_info.json (deployment details)")
        print(f"{'='*70}")
        
        return len(failed_steps) == 0

def main():
    """Main function"""
    print("🚀 Server Deployment Preparation")
    print("This script prepares everything for server transfer")
    
    deployer = ServerDeployer()
    
    # Get server information
    print(f"\n📡 Current server settings:")
    print(f"  User: {deployer.server_user}")
    print(f"  Host: {deployer.server_host}")
    print(f"  Path: {deployer.remote_path}")
    
    response = input(f"\n❓ Are server settings correct? (y/n) or enter server IP: ")
    
    if response.lower() in ['n', 'no']:
        deployer.server_host = input("🌐 Enter server IP: ")
        deployer.server_user = input("👤 Server username (default: sadjad): ") or "sadjad"
        deployer.remote_path = input("📁 Server path (default: /home/sadjad): ") or "/home/sadjad"
    elif not response.lower() in ['y', 'yes'] and '.' in response:
        # If IP was entered
        deployer.server_host = response
    
    print(f"\n✅ Final settings:")
    print(f"  Server: {deployer.server_user}@{deployer.server_host}:{deployer.remote_path}")
    
    confirm = input("\n🚀 Start preparation? (y/n): ")
    if confirm.lower() in ['y', 'yes']:
        deployer.run_full_deployment()
    else:
        print("❌ Cancelled")

if __name__ == "__main__":
    main() 