# GitHub Actions Deployment Fix Guide

## Issue Summary
The GitHub Actions deployment workflow is failing at the "Deploy to EC2" step because the required GitHub secrets are either missing or incorrect.

## Required GitHub Secrets

The workflow needs these three secrets configured in your GitHub repository:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `EC2_HOST` | EC2 instance IP or hostname | `18.118.82.111` or `ec2-xx-xx-xx-xx.compute.amazonaws.com` |
| `EC2_USER` | SSH username for EC2 | `ubuntu` (default for Ubuntu) or `ec2-user` (for Amazon Linux) |
| `EC2_SSH_PRIVATE_KEY` | Private SSH key content | Full content of your `.pem` file |

## Step-by-Step Fix

### Step 1: Determine Your EC2 Instance Details

First, we need to identify which EC2 instance to use. Based on your project files, you have references to:
- `18.118.82.111` (most recent in API docs)
- `18.190.69.205` (older references)
- `ec2-18-118-82-111.us-east-2.compute.amazonaws.com`

**Action Required:** Verify which EC2 instance is currently active by checking:
1. AWS EC2 Console: https://console.aws.amazon.com/ec2
2. Look for instances with tag "camp-card" or similar
3. Note the Public IPv4 address and DNS name

### Step 2: Test SSH Access Locally

Before setting up GitHub secrets, verify you can SSH into the instance:

```bash
# Test with your local SSH key
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP

# If successful, you should see the Ubuntu prompt
# If failed, you may need to:
# 1. Start the EC2 instance (if stopped)
# 2. Update security group to allow SSH from your IP
# 3. Use the correct SSH key file
```

### Step 3: Get Your SSH Private Key Content

```bash
# Display your SSH private key (this is what goes in EC2_SSH_PRIVATE_KEY secret)
cat ~/.ssh/campcard-ec2-aws.pem

# The output should start with:
# -----BEGIN RSA PRIVATE KEY-----
# or
# -----BEGIN OPENSSH PRIVATE KEY-----
```

**Important:** Copy the ENTIRE key content including the BEGIN and END lines.

### Step 4: Add Secrets to GitHub Repository

1. Go to your GitHub repository: https://github.com/SwipeSavdev/camp-card
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add each secret:

#### Secret 1: EC2_HOST
- Name: `EC2_HOST`
- Value: Your EC2 IP or hostname (e.g., `18.118.82.111`)
- Click **Add secret**

#### Secret 2: EC2_USER
- Name: `EC2_USER`
- Value: `ubuntu` (or `ec2-user` if using Amazon Linux)
- Click **Add secret**

#### Secret 3: EC2_SSH_PRIVATE_KEY
- Name: `EC2_SSH_PRIVATE_KEY`
- Value: Paste the entire content of your `.pem` file
- Click **Add secret**

### Step 5: Verify EC2 Instance Setup

SSH into your EC2 instance and ensure Docker is installed:

```bash
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP

# Check Docker is installed
docker --version

# Check if campcard directory exists
ls -la ~/campcard

# If directory doesn't exist, create it
mkdir -p ~/campcard

# Check if docker-compose is available
docker compose version
```

### Step 6: Re-run the Deployment

After adding the secrets, you have two options:

#### Option A: Push a New Commit (Recommended)
```bash
# Make a small change to trigger deployment
cd /Users/papajr/Documents/Projects\ -\ 2026/camp-card
echo "# Deployment test" >> .github/DEPLOYMENT_TEST.md
git add .github/DEPLOYMENT_TEST.md
git commit -m "chore: trigger deployment after fixing GitHub secrets"
git push origin main
```

#### Option B: Manually Re-run Failed Workflow
1. Go to: https://github.com/SwipeSavdev/camp-card/actions/runs/21081478045
2. Click **Re-run jobs** → **Re-run failed jobs**
3. Monitor the deployment progress

### Step 7: Monitor Deployment

1. Go to: https://github.com/SwipeSavdev/camp-card/actions
2. Click on the running workflow
3. Watch the "Deploy to EC2" job
4. After success, check the "Verify Deployment" step for health check results

### Step 8: Get Expo Tunnel URL

Once deployment succeeds, retrieve the Expo tunnel URL:

```bash
# Option 1: Use our helper script
./scripts/get-expo-tunnel.sh

# Option 2: SSH and check logs directly
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP
docker logs campcard-mobile | grep -A 10 "Tunnel"
```

The tunnel URL will look like: `exp://u.expo.dev/xxx...` or `exp://xxx.exp.direct:443`

## Troubleshooting

### Issue: "Permission denied (publickey)" during deployment
**Solution:**
- Verify EC2_SSH_PRIVATE_KEY secret contains the correct private key
- Ensure the key matches the one authorized in EC2 instance
- Check EC2 instance's `~/.ssh/authorized_keys`

### Issue: "Connection timeout" during deployment
**Solution:**
- Verify EC2 instance is running (not stopped)
- Check EC2 security group allows inbound SSH (port 22) from GitHub Actions IPs
- GitHub Actions uses dynamic IPs, so you may need to allow 0.0.0.0/0 (or use a bastion host)

### Issue: Docker commands fail on EC2
**Solution:**
```bash
# SSH into EC2
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in for changes to take effect
exit
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP

# Verify docker works without sudo
docker ps
```

### Issue: Expo tunnel not starting
**Solution:**
```bash
# Check mobile container logs
docker logs campcard-mobile --tail 100

# Restart mobile container
docker restart campcard-mobile

# Wait 30 seconds and check logs again
sleep 30
docker logs campcard-mobile --tail 50
```

## Security Note

The EC2 security group should ideally restrict SSH access. GitHub Actions IPs are dynamic, so you have these options:
1. Allow SSH from 0.0.0.0/0 (least secure but simplest)
2. Use a bastion host / jump server
3. Use AWS Systems Manager Session Manager instead of SSH
4. Use GitHub self-hosted runners on a private network

## Quick Command Reference

```bash
# Check if EC2 is reachable
ping -c 3 YOUR_EC2_IP

# Test SSH connection
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP "echo Connected successfully"

# Check what's running on EC2
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP "docker ps"

# Get Expo URL
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP "docker logs campcard-mobile 2>&1 | grep -i 'exp://'"

# View recent deployment logs
ssh -i ~/.ssh/campcard-ec2-aws.pem ubuntu@YOUR_EC2_IP "tail -50 ~/campcard/deploy.log"
```

## Next Steps After Successful Deployment

1. ✅ Verify backend API: `http://YOUR_EC2_IP:7010/actuator/health`
2. ✅ Verify web portal: `http://YOUR_EC2_IP:7020`
3. ✅ Get Expo tunnel URL from mobile container logs
4. ✅ Test mobile app with Expo Go on your phone
5. ✅ Test all new features:
   - Biometric authentication
   - Forgot password flow
   - Email verification
   - Settings notifications

## Contact

If you continue to have issues, provide:
- GitHub Actions workflow run URL
- EC2 instance ID or IP
- Error messages from the failed deployment step
