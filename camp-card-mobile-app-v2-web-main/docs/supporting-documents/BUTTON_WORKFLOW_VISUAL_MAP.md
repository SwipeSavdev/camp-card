# Visual Button & Workflow Map

## CUSTOMER ACCOUNT (Role: customer@example.com)

```

 LOGIN SCREEN 

 
 Email: [customer@example.com] 
 Password: [] 
 
 
   LOGIN BUTTON (Blue) 
 
 
 Don't have account? 
 
   SIGN UP BUTTON (Blue) 
 

  (after login)

  Home  Wallet  Settings 

 
 
  WALLET SCREEN 
 
  
  Your Camp Card 
  [Card Image with Flip] 
  [ FLIP BUTTON (top-left)] 
  
 
  Refer Friends 
  
  Earn Rewards... 
  [Light Blue Info Box] 
  
  YOUR REFERRAL CODE: 
  [CUST-12345] [ COPY BTN]   TEST THIS
  
  SHARE YOUR LINK: 
  [https://camp...] 2x 
  
  
   View Referral History   TEST THIS
  
  
    Share Referral Link   TEST THIS
   (Blue Button) 
  
  
 
 

 REFERRAL HISTORY SCREEN 

  Back Referral History (5) 
 
 Loading spinner (briefly) 
  
 
  John Smith 
  Completed $25.00 
  Jan 12, 2025 
 
 
 
  Jane Doe  
  Pending Pending 
  Jan 10, 2025 
 
 
 [ Back Button (top-left)]   TEST THIS

```

---

## SCOUT ACCOUNT (Role: scout@example.com)

```

  Scout Home  Share  Scout Settings 




SCOUT HOME SCREEN

 Scout Dashboard 

 
 Loading spinner (briefly) 
  
 
  Recruits  Active  Earnings Redemptions
  23  5  $450  12 
 
 
 Recruitment Pipeline 
  Pending: 8 
  Accepted: 12 
  Rejected: 3 
 
 
   Share Scout Link (Red Button)   TEST THIS
 
 




SCOUT SHARE SCREEN

 Share Scout Link 

 
 INFO BOX: 
 "Earn rewards when you share and..." 
 
 YOUR SCOUT CODE: 
 [SCOUT-12345] [ COPY]  TEST THIS 
 
 SHARE YOUR LINK: 
 [https://campcard.app/scout/...] 2x 
 
 Quick Share Methods: 
  
 Facebook Email  WhatsApp  SMS  
  f  @  W  S  
  
 
 
   Share (Blue Button - Opens Native Sheet)   TEST THIS
 
 




SCOUT SETTINGS SCREEN

 Settings 
 Scout Name (John Smith) 

 
 NOTIFICATIONS 
  
  Push Notifications  [Toggle]    TEST THIS
 Scout activity and updates  ON/OFF  
  
 
  
  Location Sharing  [Toggle]    TEST THIS
 Show nearby opportunities  ON/OFF  
  
 
  
  Marketing Emails  [Toggle]    TEST THIS
 New features and offers  ON/OFF  
  
 
 ACTIONS 
  
   Export Report []    TEST THIS
  
  
  View Analytics []    TEST THIS
  
 
 ACCOUNT 
  
   Sign Out (Red) []    TEST THIS
   
  Confirmation Alert:  
  "Sure? [Cancel] [Sign Out]"  
  
 

```

---

## LEADER ACCOUNT (Role: leader@example.com)

```

  Leader Home  Scouts  Share  Settings 




LEADER HOME SCREEN

 Leader Dashboard 

 
 Loading spinner (briefly) 
  
  
  Scouts  Active  Total Earnings  
  18  12  $1,250  
  
 
 Recruitment Pipeline 
  Pending: 6 
  Accepted: 12 
  Rejected: 0 
 
 
   Share Troop Link (Red)   TEST THIS
 
 
   Manage Scouts (Outlined)   TEST THIS
 
 

 


LEADER SCOUTS SCREEN (After "Manage Scouts" button)

  Back Scouts (18) 

 
 
   Invite New Scout []   TEST THIS
 
 
  
  John Smith [Active]   
  john@scouts.com  
  Troop #123  
  Recruits: 5 | Earnings: $150  
  Joined: Jan 5, 2025  
  
 
  
  Jane Doe [Inactive]   
  jane@scouts.com  
  Troop #124  
  Recruits: 2 | Earnings: $75  
  Joined: Dec 28, 2024  
  
 
  
  Mike Johnson [Invited]   
  mike@scouts.com  
  Troop #125  
  Recruits: 0 | Earnings: $0  
  Invited: Jan 15, 2025  
  
 

  [Back Button - top left]  TEST THIS



LEADER SHARE SCREEN

 Share Troop Link 

 
 INFO BOX: 
 "Grow your troop! Share and earn..." 
 
 YOUR TROOP CODE: 
 [TROOP-12345] [ COPY]  TEST THIS 
 
 SHARE YOUR LINK: 
 [https://campcard.app/troop/...] 2x 
 
 Quick Share Methods: 
  
 Facebook Email  WhatsApp  SMS  
  f  @  W  S  
  
 
 
   Share (Blue Button)   TEST THIS
 
 




LEADER SETTINGS SCREEN

 Settings 
 Leader Name (John Troop) 

 
 NOTIFICATIONS 
  
  Push Notifications  [Toggle]    TEST THIS
 Scout activity and updates  ON/OFF  
  
 
  
  Location Sharing  [Toggle]    TEST THIS
 Show nearby opportunities  ON/OFF  
  
 
  
  Marketing Emails  [Toggle]    TEST THIS
 New features and offers  ON/OFF  
  
 
 ACTIONS 
  
   Export Report []    TEST THIS
  
  
  View Analytics []    TEST THIS
  
 
 ACCOUNT 
  
   Sign Out (Red) []    TEST THIS
   
  Confirmation Alert:  
  "Sure? [Cancel] [Sign Out]"  
  
 

```

---

## BUTTON INTERACTION STATE FLOW

```

 NORMAL STATE 
 Button text readable 
 Proper color 
 Slightly elevated (shadow) 

  User taps
 

 PRESSED STATE 
 Opacity changes (0.7) 
 Button depresses slightly 
 Immediate feedback 

  If async operation:
 

 LOADING STATE 
 Button disabled (grayed) 
 Spinner/ActivityIndicator 
 Cannot be pressed again 

  Operation completes
 

 SUCCESS STATE 
 Returns to NORMAL STATE 
 Or shows alert/feedback 
 Button re-enabled 


 OR


 ERROR STATE 
 Returns to NORMAL STATE 
 Shows error alert 
 Button re-enabled 
 User can retry 

```

---

## NATIVE SHARE SHEET FLOW

```
User taps Share button
 
Button shows loading state
 
Share.share() triggered
 
Native share sheet opens

 Share via: 
  Messages 
  Email 
  WhatsApp 
  Facebook 
  Twitter 
  Copy 
  Cancel 

 
User selects platform
 
App calls logShare() API
 
API response: success
 
Loading state disappears
 
Button re-enabled
 
User back in app
```

---

## TOGGLE SWITCH FLOW

```
Initial State:
Push Notifications: ON (blue, right)
Location Sharing: OFF (gray, left)
Marketing Emails: ON (blue, right)

User taps toggle:
Location Sharing: OFF  ON
 
Toggle animates left  right
 
Toggle gets disabled (grayed out)
 
API call: POST /users/{id}/settings/notifications/toggle
 notification_type: "location_enabled"
 enabled: true
 
API response received
 
Toggle re-enabled
 
Location Sharing: ON (blue, right) 

If API fails:
API error received
 
Toggle animates back to OFF
 
Error alert shows
 
User can retry
```

---

## TESTING COVERAGE MAP

```
TOTAL BUTTONS: 24+

Customer (6 buttons)
 Copy Referral Code 
 Share Referral Link 
 View Referral History 
 Back (History) 
 Sign Up 
 Login 

Scout (9 buttons)
 Share Scout Link 
 Copy Scout Code 
 Share (Share tab) 
 Push Notifications Toggle 
 Location Sharing Toggle 
 Marketing Emails Toggle 
 Export Report 
 View Analytics 
 Sign Out 

Leader (9 buttons)
 Share Troop Link 
 Manage Scouts 
 Back (Scouts list) 
 Invite New Scout 
 Copy Troop Code 
 Share (Share tab) 
 Push Notifications Toggle 
 Location Sharing Toggle 
 Marketing Emails Toggle 
 Export Report 
 View Analytics 
 Sign Out 

Shared (1 button)
 Back buttons across all screens 
```

---

**Print this map or keep it open while testing!** 
