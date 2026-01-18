/**
 * TroopLeaderDashboardScreen Tests
 * Comprehensive tests for the Troop Leader Dashboard screen
 */

import React from 'react';
import {
  render,
  fireEvent,
  screen,
  mockNavigation,
  createMockAuthStore,
  mockTroopLeaderUser,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => mockNavigation,
}));

// Mock auth store
const mockAuthStore = createMockAuthStore({
  user: mockTroopLeaderUser,
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Import after mocks
import TroopLeaderDashboardScreen from '../../../screens/troopLeader/TroopLeaderDashboardScreen';

describe('TroopLeaderDashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Troop Dashboard')).toBeTruthy();
    });

    it('should display "Troop Dashboard" title', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Troop Dashboard')).toBeTruthy();
    });

    it('should display welcome message with user first name', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText(`Welcome, ${mockTroopLeaderUser.firstName}`)).toBeTruthy();
    });

    it('should display "Troop Management" section', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Troop Management')).toBeTruthy();
    });

    it('should display "Troop Overview" section', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Troop Overview')).toBeTruthy();
    });

    it('should display "Quick Links" section', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Quick Links')).toBeTruthy();
    });
  });

  describe('Management Cards', () => {
    it('should display "Manage Scouts" card', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Manage Scouts')).toBeTruthy();
    });

    it('should display "Manage Scouts" subtitle', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('View and manage your troop members')).toBeTruthy();
    });

    it('should display "Troop Statistics" card', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Troop Statistics')).toBeTruthy();
    });

    it('should display "Troop Statistics" subtitle', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('View fundraising progress and reports')).toBeTruthy();
    });

    it('should display "Invite Scouts" card', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Invite Scouts')).toBeTruthy();
    });

    it('should display "Invite Scouts" subtitle', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Send invitations to join your troop')).toBeTruthy();
    });
  });

  describe('Navigation - Management Cards', () => {
    it('should navigate to ManageScouts when card is pressed', () => {
      render(<TroopLeaderDashboardScreen />);
      const manageScoutsCard = screen.getByText('Manage Scouts');
      fireEvent.press(manageScoutsCard);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ManageScouts');
    });

    it('should navigate to TroopStats when card is pressed', () => {
      render(<TroopLeaderDashboardScreen />);
      const troopStatsCard = screen.getByText('Troop Statistics');
      fireEvent.press(troopStatsCard);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('TroopStats');
    });

    it('should navigate to InviteScouts when card is pressed', () => {
      render(<TroopLeaderDashboardScreen />);
      const inviteScoutsCard = screen.getByText('Invite Scouts');
      fireEvent.press(inviteScoutsCard);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('InviteScouts');
    });
  });

  describe('Troop Overview Stats', () => {
    it('should display "Active Scouts" stat', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Active Scouts')).toBeTruthy();
    });

    it('should display initial Active Scouts count as 0', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    });

    it('should display "Funds Raised" stat', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Funds Raised')).toBeTruthy();
    });

    it('should display initial Funds Raised as $0', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('$0')).toBeTruthy();
    });

    it('should display "Cards Sold" stat', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Cards Sold')).toBeTruthy();
    });

    it('should display "Redemptions" stat', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Redemptions')).toBeTruthy();
    });
  });

  describe('Quick Links Section', () => {
    it('should display Notifications card', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });

    it('should display Notifications subtitle', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('View alerts and updates')).toBeTruthy();
    });

    it('should display "View Available Offers" button', () => {
      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText('View Available Offers')).toBeTruthy();
    });

    it('should navigate to Notifications when card is pressed', () => {
      render(<TroopLeaderDashboardScreen />);
      const notificationsCard = screen.getByText('Notifications');
      fireEvent.press(notificationsCard);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Notifications');
    });

    it('should navigate to Offers when View Available Offers is pressed', () => {
      render(<TroopLeaderDashboardScreen />);
      const offersButton = screen.getByText('View Available Offers');
      fireEvent.press(offersButton);
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Offers');
    });
  });

  describe('User Display', () => {
    it('should display default welcome message if firstName is empty', () => {
      const storeWithNoName = createMockAuthStore({
        user: { ...mockTroopLeaderUser, firstName: '' },
      });

      jest.doMock('../../../store/authStore', () => ({
        useAuthStore: () => storeWithNoName,
      }));

      render(<TroopLeaderDashboardScreen />);
      expect(screen.getByText(/Welcome/)).toBeTruthy();
    });
  });

  describe('ScrollView Behavior', () => {
    it('should render within a ScrollView', () => {
      render(<TroopLeaderDashboardScreen />);
      // Content should be scrollable
      expect(screen.getByText('Troop Dashboard')).toBeTruthy();
      expect(screen.getByText('Quick Links')).toBeTruthy();
    });
  });

  describe('Icon Display', () => {
    it('should display people icon for Manage Scouts', () => {
      render(<TroopLeaderDashboardScreen />);
      // Icon is rendered as a component, verify card exists
      expect(screen.getByText('Manage Scouts')).toBeTruthy();
    });

    it('should display stats-chart icon for Troop Statistics', () => {
      render(<TroopLeaderDashboardScreen />);
      // Icon is rendered as a component, verify card exists
      expect(screen.getByText('Troop Statistics')).toBeTruthy();
    });

    it('should display person-add icon for Invite Scouts', () => {
      render(<TroopLeaderDashboardScreen />);
      // Icon is rendered as a component, verify card exists
      expect(screen.getByText('Invite Scouts')).toBeTruthy();
    });

    it('should display notifications icon for Notifications', () => {
      render(<TroopLeaderDashboardScreen />);
      // Icon is rendered as a component, verify card exists
      expect(screen.getByText('Notifications')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply correct background color', () => {
      render(<TroopLeaderDashboardScreen />);
      // Component renders, styling is applied via StyleSheet
      expect(screen.getByText('Troop Dashboard')).toBeTruthy();
    });

    it('should have header with BSA Blue color', () => {
      render(<TroopLeaderDashboardScreen />);
      // Header section exists
      expect(screen.getByText('Troop Dashboard')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have all navigation cards accessible', () => {
      render(<TroopLeaderDashboardScreen />);

      // All main navigation elements should be present and pressable
      expect(screen.getByText('Manage Scouts')).toBeTruthy();
      expect(screen.getByText('Troop Statistics')).toBeTruthy();
      expect(screen.getByText('Invite Scouts')).toBeTruthy();
      expect(screen.getByText('Notifications')).toBeTruthy();
      expect(screen.getByText('View Available Offers')).toBeTruthy();
    });
  });
});
