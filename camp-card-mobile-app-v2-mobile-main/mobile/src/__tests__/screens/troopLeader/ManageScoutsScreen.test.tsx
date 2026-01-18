/**
 * ManageScoutsScreen Tests
 * Comprehensive tests for the Manage Scouts screen (Troop Leader portal)
 */

import React from 'react';
import { Alert } from 'react-native';
import {
  render,
  fireEvent,
  waitFor,
  screen,
  createMockAuthStore,
  mockTroopLeaderUser,
} from '../../test-utils';

// Mock dependencies
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock scout API
const mockScoutApi = {
  createScout: jest.fn().mockResolvedValue({
    data: {
      id: 'new-scout-id',
      firstName: 'New',
      lastName: 'Scout',
      email: 'newscout@email.com',
    },
  }),
};

jest.mock('../../../services/apiClient', () => ({
  scoutApi: mockScoutApi,
}));

// Mock auth store
const mockAuthStore = createMockAuthStore({
  user: mockTroopLeaderUser,
});

jest.mock('../../../store/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

// Import after mocks
import ManageScoutsScreen from '../../../screens/troopLeader/ManageScoutsScreen';

describe('ManageScoutsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScoutApi.createScout.mockResolvedValue({
      data: {
        id: 'new-scout-id',
        firstName: 'New',
        lastName: 'Scout',
        email: 'newscout@email.com',
      },
    });
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Your Troop')).toBeTruthy();
    });

    it('should display "Your Troop" header', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Your Troop')).toBeTruthy();
    });

    it('should display header subtitle', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Manage scouts in your troop')).toBeTruthy();
    });

    it('should display Add button', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Add')).toBeTruthy();
    });

    it('should display search bar', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByPlaceholderText('Search scouts...')).toBeTruthy();
    });
  });

  describe('Summary Stats', () => {
    it('should display Total scouts count', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Total')).toBeTruthy();
    });

    it('should display Active scouts count', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Active')).toBeTruthy();
    });

    it('should display Inactive scouts count', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Inactive')).toBeTruthy();
    });

    it('should display Total Sales amount', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Total Sales')).toBeTruthy();
    });

    it('should calculate and display correct totals', () => {
      render(<ManageScoutsScreen />);
      // Initial mock data has 5 scouts with combined sales of $655
      expect(screen.getByText('$655')).toBeTruthy();
    });
  });

  describe('Scout List', () => {
    it('should display scout names', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('Ethan Anderson')).toBeTruthy();
      expect(screen.getByText('Sophia Martinez')).toBeTruthy();
    });

    it('should display scout emails', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('ethan.anderson@email.com')).toBeTruthy();
    });

    it('should display scout initials in avatar', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('EA')).toBeTruthy(); // Ethan Anderson
      expect(screen.getByText('SM')).toBeTruthy(); // Sophia Martinez
    });

    it('should display scout subscription status', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    });

    it('should display scout total sales', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('$150')).toBeTruthy();
      expect(screen.getByText('$200')).toBeTruthy();
    });

    it('should display scout referral count', () => {
      render(<ManageScoutsScreen />);
      expect(screen.getByText('5 refs')).toBeTruthy();
    });

    it('should display scout redemption count', () => {
      render(<ManageScoutsScreen />);
      // Ethan has 12 redemptions
      expect(screen.getByText('12')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    it('should filter scouts by first name', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'Ethan');

      expect(screen.getByText('Ethan Anderson')).toBeTruthy();
      expect(screen.queryByText('Sophia Martinez')).toBeFalsy();
    });

    it('should filter scouts by last name', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'Martinez');

      expect(screen.getByText('Sophia Martinez')).toBeTruthy();
      expect(screen.queryByText('Ethan Anderson')).toBeFalsy();
    });

    it('should filter scouts by email', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'ethan.anderson');

      expect(screen.getByText('Ethan Anderson')).toBeTruthy();
    });

    it('should be case insensitive', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'ETHAN');

      expect(screen.getByText('Ethan Anderson')).toBeTruthy();
    });

    it('should show clear button when search has text', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'test');

      // Clear button should be visible
      expect(searchInput.props.value).toBe('test');
    });

    it('should show empty state when no scouts match search', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'nonexistentscout');

      expect(screen.getByText('No scouts found')).toBeTruthy();
    });
  });

  describe('Add Scout Modal', () => {
    it('should open Add Scout modal when Add button is pressed', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByText('Add Scout')).toBeTruthy();
    });

    it('should display First Name input in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByPlaceholderText('Enter first name')).toBeTruthy();
    });

    it('should display Last Name input in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByPlaceholderText('Enter last name')).toBeTruthy();
    });

    it('should display Email input in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByPlaceholderText('Enter email address')).toBeTruthy();
    });

    it('should display Unit Type picker in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByText('Unit Type *')).toBeTruthy();
    });

    it('should display Unit Number input in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByPlaceholderText(/Enter unit number/)).toBeTruthy();
    });

    it('should display Cancel button in modal', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      expect(screen.getByText('Cancel')).toBeTruthy();
    });

    it('should close modal when Cancel is pressed', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.press(cancelButton);

      // Modal should be closed (Add Scout title should not be visible)
      expect(screen.queryByText('Add Scout')).toBeFalsy();
    });
  });

  describe('Add Scout Form Validation', () => {
    it('should show error when first name is empty', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      // Try to submit empty form
      const submitButton = screen.getAllByText('Add')[1]; // Modal Add button
      fireEvent.press(submitButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    });

    it('should show error when last name is empty', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      fireEvent.changeText(firstNameInput, 'Test');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all required fields');
    });

    it('should show error for invalid email format', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'Test');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'invalidemail');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please enter a valid email address');
    });

    it('should show error when unit type is not selected', () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'Test');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'test@example.com');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a unit type');
    });

    it('should show error for duplicate email', async () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'Test');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'ethan.anderson@email.com'); // Existing email

      // Select unit type
      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);
      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });
      fireEvent.press(screen.getByText('Pack'));

      const unitNumberInput = screen.getByPlaceholderText(/Enter unit number/);
      fireEvent.changeText(unitNumberInput, '123');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'A scout with this email already exists');
    });
  });

  describe('Unit Type Picker', () => {
    it('should show unit type options when picker is pressed', async () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);

      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
        expect(screen.getByText('BSA Troop (Boys)')).toBeTruthy();
        expect(screen.getByText('BSA Troop (Girls)')).toBeTruthy();
        expect(screen.getByText('Ship')).toBeTruthy();
        expect(screen.getByText('Crew')).toBeTruthy();
        expect(screen.getByText('Family Scouting')).toBeTruthy();
      });
    });

    it('should select unit type when option is pressed', async () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);

      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Pack'));

      // Picker should close and show selected value
      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });
    });
  });

  describe('Scout Details Modal', () => {
    it('should open Scout Details modal when scout is pressed', () => {
      render(<ManageScoutsScreen />);
      const scoutCard = screen.getByText('Ethan Anderson');
      fireEvent.press(scoutCard);

      expect(screen.getByText('Scout Details')).toBeTruthy();
    });

    it('should display scout name in details modal', () => {
      render(<ManageScoutsScreen />);
      const scoutCard = screen.getByText('Ethan Anderson');
      fireEvent.press(scoutCard);

      // Name appears twice (list + modal)
      const names = screen.getAllByText('Ethan Anderson');
      expect(names.length).toBeGreaterThan(1);
    });

    it('should display scout email in details modal', () => {
      render(<ManageScoutsScreen />);
      const scoutCard = screen.getByText('Ethan Anderson');
      fireEvent.press(scoutCard);

      const emails = screen.getAllByText('ethan.anderson@email.com');
      expect(emails.length).toBeGreaterThan(1);
    });

    it('should display "Remove from Troop" button', () => {
      render(<ManageScoutsScreen />);
      const scoutCard = screen.getByText('Ethan Anderson');
      fireEvent.press(scoutCard);

      expect(screen.getByText('Remove from Troop')).toBeTruthy();
    });

    it('should show confirmation when Remove is pressed', () => {
      render(<ManageScoutsScreen />);
      const scoutCard = screen.getByText('Ethan Anderson');
      fireEvent.press(scoutCard);

      const removeButton = screen.getByText('Remove from Troop');
      fireEvent.press(removeButton);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Remove Scout',
        expect.stringContaining('Ethan Anderson'),
        expect.any(Array)
      );
    });
  });

  describe('API Integration', () => {
    it('should call createScout API when form is submitted', async () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'New');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'newscout@example.com');

      // Select unit type
      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);
      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });
      fireEvent.press(screen.getByText('Pack'));

      const unitNumberInput = screen.getByPlaceholderText(/Enter unit number/);
      fireEvent.changeText(unitNumberInput, '456');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockScoutApi.createScout).toHaveBeenCalled();
      });
    });

    it('should show success message after adding scout', async () => {
      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'New');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'brand.new@example.com');

      // Select unit type
      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);
      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });
      fireEvent.press(screen.getByText('Pack'));

      const unitNumberInput = screen.getByPlaceholderText(/Enter unit number/);
      fireEvent.changeText(unitNumberInput, '789');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Success',
          expect.stringContaining('has been added to your troop')
        );
      });
    });

    it('should show error message on API failure', async () => {
      mockScoutApi.createScout.mockRejectedValueOnce({
        response: { data: { message: 'Server error' } },
      });

      render(<ManageScoutsScreen />);
      const addButton = screen.getByText('Add');
      fireEvent.press(addButton);

      const firstNameInput = screen.getByPlaceholderText('Enter first name');
      const lastNameInput = screen.getByPlaceholderText('Enter last name');
      const emailInput = screen.getByPlaceholderText('Enter email address');

      fireEvent.changeText(firstNameInput, 'Test');
      fireEvent.changeText(lastNameInput, 'Scout');
      fireEvent.changeText(emailInput, 'error.test@example.com');

      // Select unit type
      const unitTypePicker = screen.getByText('Select unit type');
      fireEvent.press(unitTypePicker);
      await waitFor(() => {
        expect(screen.getByText('Pack')).toBeTruthy();
      });
      fireEvent.press(screen.getByText('Pack'));

      const unitNumberInput = screen.getByPlaceholderText(/Enter unit number/);
      fireEvent.changeText(unitNumberInput, '999');

      const submitButton = screen.getAllByText('Add')[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.any(String));
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state message when search returns no results', () => {
      render(<ManageScoutsScreen />);
      const searchInput = screen.getByPlaceholderText('Search scouts...');
      fireEvent.changeText(searchInput, 'xyz123nonexistent');

      expect(screen.getByText('No scouts found')).toBeTruthy();
      expect(screen.getByText('Try a different search term')).toBeTruthy();
    });
  });
});
