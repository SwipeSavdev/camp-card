#!/bin/bash
# ============================================================================
# Setup GitHub Secrets for Camp Card Deployment
# ============================================================================
# This script helps configure GitHub secrets for automated deployment
# ============================================================================

set -e

REPO="SwipeSavdev/camp-card"
EC2_HOST="18.190.69.205"
EC2_USER="ubuntu"
SSH_KEY_PATH="$HOME/.ssh/campcard-github-actions"

echo "============================================"
echo "GitHub Secrets Setup for Camp Card"
echo "============================================"
echo ""
echo "Repository: $REPO"
echo "EC2 Host: $EC2_HOST"
echo "EC2 User: $EC2_USER"
echo "SSH Key: $SSH_KEY_PATH"
echo ""

# Check if gh CLI is installed and authenticated
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo ""
    echo "Please install it first:"
    echo "  brew install gh"
    echo ""
    echo "Or use the manual method below."
    MANUAL_ONLY=true
else
    echo "✅ GitHub CLI (gh) is installed"

    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo "⚠️  Not authenticated with GitHub CLI"
        echo ""
        echo "Please run:"
        echo "  gh auth login"
        echo ""
        MANUAL_ONLY=true
    else
        echo "✅ GitHub CLI is authenticated"
        MANUAL_ONLY=false
    fi
fi

echo ""
echo "============================================"

if [ "$MANUAL_ONLY" = true ]; then
    echo "MANUAL SETUP REQUIRED"
    echo "============================================"
    echo ""
    echo "Go to: https://github.com/$REPO/settings/secrets/actions"
    echo ""
    echo "Add these 3 secrets:"
    echo ""
    echo "---"
    echo "Secret 1: EC2_HOST"
    echo "Value:"
    echo "$EC2_HOST"
    echo ""
    echo "---"
    echo "Secret 2: EC2_USER"
    echo "Value:"
    echo "$EC2_USER"
    echo ""
    echo "---"
    echo "Secret 3: EC2_SSH_PRIVATE_KEY"
    echo "Value (copy entire output below):"
    echo ""
    cat "$SSH_KEY_PATH"
    echo ""
    echo "---"
else
    echo "AUTOMATED SETUP"
    echo "============================================"
    echo ""
    read -p "Set up secrets automatically? (y/n) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Setting up secrets..."

        # Set EC2_HOST
        echo "$EC2_HOST" | gh secret set EC2_HOST --repo "$REPO"
        echo "✅ Set EC2_HOST"

        # Set EC2_USER
        echo "$EC2_USER" | gh secret set EC2_USER --repo "$REPO"
        echo "✅ Set EC2_USER"

        # Set EC2_SSH_PRIVATE_KEY
        gh secret set EC2_SSH_PRIVATE_KEY --repo "$REPO" < "$SSH_KEY_PATH"
        echo "✅ Set EC2_SSH_PRIVATE_KEY"

        echo ""
        echo "✅ All secrets configured successfully!"
    else
        echo ""
        echo "Skipped automatic setup."
        echo "Use the manual method shown above."
    fi
fi

echo ""
echo "============================================"
echo "Next Steps"
echo "============================================"
echo ""
echo "1. Verify secrets at:"
echo "   https://github.com/$REPO/settings/secrets/actions"
echo ""
echo "2. Trigger a new deployment:"
echo "   git commit --allow-empty -m 'chore: trigger deployment'"
echo "   git push origin main"
echo ""
echo "3. Monitor deployment:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "4. After deployment, get Expo URL:"
echo "   ./scripts/get-expo-tunnel.sh"
echo ""
