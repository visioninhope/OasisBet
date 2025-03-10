import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { screen, render, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import AccountLanding from './AccountLanding';
import userEvent from '@testing-library/user-event';
import { jwtAuthenticate, updateAccDetails } from '../../services/api/ApiService';
import Withdrawals from './Withdrawals';

const mockReducer = {
  accountDetails: {
    withdrawalAmt: 100
  },
  login: {
    isUserLoggedIn: true
  },
  error: {
    showError: false,
    errorText: ""
  }
};

const mockStore = configureMockStore();
const store = mockStore(mockReducer);

jest.mock('../../services/api/ApiService.ts', () => ({
  updateAccDetails: jest.fn(),
  jwtAuthenticate: jest.fn()
}));

const mockHandleNavToTrxHist = jest.fn();

const mockJwtTokenResponse = {
  token: "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDSE9PTkFOTiIsImV4cCI6MTcyNTA1NjkxMSwiaWF0IjoxNzI1MDU2MDExfQ.iGbRbL-PFQnzYNSLrmy8p67NjQrPXpOTkFeF41FyPB8QYxRjzqASmsR9cTrm2C7m30_tc3FFIYFIkAK-FgFsyg"
};

const mockWithdrawSuccessResponse = {
  account: {
    balance: 227.13,
  },
  statusCode: 0,
  resultMessage: 'Withdrawal was successful.'
};

const mockWithdrawFailureResponse = {
  statusCode: 3,
  resultMessage: 'The withdrawal amount is more than the current account balance'
};

describe('Withdrawals Component', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.setItem('ACCOUNT_DETAILS', '{"accId":1000022,"usrId":26,"balance":0,"depositLimit":1000,"depositAmt":null,"withdrawalAmt":null,"actionType":null,"ytdDepositAmt":5000,"ytdWithdrawalAmt":2000,"betLimit":200,"mtdDepositAmt":null,"mtdBetAmount":null,"mthPayout":null}');
    sessionStorage.setItem('AUTH_USER', 'CHOONANN');

  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should render Withdrawals elements when user is logged in', async () => {
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const heading = screen.getByRole('heading', { name: /Withdrawals/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    expect(heading).toBeDefined();
    expect(cancelButton).toBeDefined();
    expect(confirmButton).toBeDefined();
    expect(withdrawalInput).toBeDefined();
    expect(passwordInput).toBeDefined();
  });

  it('should render Withdrawals as Header when user selected side nav menu', async () => {
    const user = userEvent.setup();

    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <AccountLanding />
          </MemoryRouter>
        </Provider>
      ); 
    });

    await user.click(screen.getByText(/Withdrawals/i)); 
    const withdrawalsHeader = screen.getByRole('heading', { name: /Withdrawals/i });
    expect(withdrawalsHeader).toBeDefined();
  });

  it('should render AccountLogin elements when user is not logged in', async () => {
    await act(async () => { 
      render(
        <Provider store={
            mockStore({
              ...mockReducer, 
              login: {
                isUserLoggedIn: false
              }
            })
          }>
          <MemoryRouter>
            <AccountLanding />
          </MemoryRouter>
        </Provider>
      );
    });

    const loginHeading = screen.getByRole('heading', { name: /Login/i });
    expect(loginHeading).toBeDefined();
    const withdrawalHeader = screen.queryByRole('heading', { name: /Withdrawals/i });
    expect(withdrawalHeader).toBeNull();
  });

  it('should show Confirm Withdrawal dialog when user inputs correct value', async () => {
    const user = userEvent.setup();
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalsInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalsInput, '100');
    await user.click(confirmButton);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeDefined();
  });

  it('should return to default UI state when user input withdrawal amount and clicks cancel', async () => {
    const user = userEvent.setup();
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.type(withdrawalInput, '100');
    await user.type(passwordInput, 'password');
    await user.click(cancelButton);
    await waitFor(() => {
      const successText = screen.queryByText('Success:');
      const errorText = screen.queryByText('Fail:');
      expect(successText).toBeNull();
      expect(errorText).toBeNull();
      expect(withdrawalInput).toHaveValue('');
      expect(passwordInput).toHaveValue('');
    });
  });

  it('should not show Confirm Withdrawal dialog when user inputs incorrect withdrawal amount format', async () => {
    const user = userEvent.setup();
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '100.');
    await user.type(passwordInput, 'password');
    await user.click(confirmBtn);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeNull();
    const errorMessage = screen.getByText(/Please enter correct format/i);
    expect(errorMessage).toBeDefined();
  });

  it('should not show Confirm Withdrawal dialog when user inputs withdrawal amount more than $199999.99', async () => {
    const user = userEvent.setup();
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmBtn = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '200000');
    await user.type(passwordInput, 'password');
    await user.click(confirmBtn);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeNull();
    const errorMessage = screen.getByText(/Maximum amount to withdraw is \$199999\.99/i);
    expect(errorMessage).toBeDefined();
  });

  it('should show withdrawal success when user enters valid amount and click confirm', async () => {
    const user = userEvent.setup();
    (jwtAuthenticate as jest.Mock).mockResolvedValue(mockJwtTokenResponse);
    (updateAccDetails as jest.Mock).mockResolvedValue(mockWithdrawSuccessResponse);
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '10');
    await user.type(passwordInput, 'password');
    await user.click(confirmButton);
    const withdrawalHeading = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeading).toBeDefined();
    const confirmDialogButton = screen.getByTestId('dialog-confirm')
    await user.click(confirmDialogButton);
    await waitFor(() => {
      const successMessage = screen.getByText(/Withdrawal was successful/i);
      expect(successMessage).toBeDefined();
    });
  });

  it('should not show successful message when token expired', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Token expired');
    (jwtAuthenticate as jest.Mock).mockResolvedValue(mockJwtTokenResponse);
    (updateAccDetails as jest.Mock).mockImplementation(() => {
      throw mockError;
    });
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '10');
    await user.type(passwordInput, 'password');
    await user.click(confirmButton);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeDefined();
    const confirmDialogButton = screen.getByTestId('dialog-confirm')
    await user.click(confirmDialogButton);
    await waitFor(() => {
      const successMessage = screen.queryByText(/Withdrawal was successful/i);
      expect(successMessage).toBeNull();
    });
  });

  it('should show error message when withdraw amount is less than $1', async () => {
    const user = userEvent.setup();
    (jwtAuthenticate as jest.Mock).mockResolvedValue(mockJwtTokenResponse);
    (updateAccDetails as jest.Mock).mockResolvedValue(mockWithdrawSuccessResponse);
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '0.05');
    await user.type(passwordInput, 'password');
    await user.click(confirmButton);
    await waitFor(() => {
      const errorMessage = screen.getByText(/Minimum amount to withdraw is \$1/i);
      expect(errorMessage).toBeDefined();
    });
  });

  it('should show incorrect password message when incorrect credentials was entered and throw Error', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Invalid Credentials!');
    (jwtAuthenticate as jest.Mock).mockImplementation(() => {
      throw mockError;
    });
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '10');
    await user.type(passwordInput, 'incorrectPassword');
    await user.click(confirmButton);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeDefined();
    const confirmDialogButton = screen.getByTestId('dialog-confirm')
    await user.click(confirmDialogButton);
    await waitFor(() => {
      const errorMessage = screen.getByText(/Incorrect Password\. Please enter correct password\./i);
      expect(errorMessage).toBeDefined();
      expect(passwordInput).toHaveValue('');
    });
  });

  it('should show incorrect password message when incorrect credentials was entered and response is null', async () => {
    const user = userEvent.setup();
    (jwtAuthenticate as jest.Mock).mockResolvedValue(null);
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '10');
    await user.type(passwordInput, 'incorrectPassword');
    await user.click(confirmButton);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeDefined();
    const confirmDialogButton = screen.getByTestId('dialog-confirm')
    await user.click(confirmDialogButton);
    await waitFor(() => {
      const errorMessage = screen.getByText(/Incorrect Password\. Please enter correct password\./i);
      expect(errorMessage).toBeDefined();
      expect(passwordInput).toHaveValue('');
    });
  });

  it('should show bank overdraft message when user withdraws amount but has insufficient amount in account', async () => {
    const user = userEvent.setup();
    (jwtAuthenticate as jest.Mock).mockResolvedValue(mockJwtTokenResponse);
    (updateAccDetails as jest.Mock).mockResolvedValue(mockWithdrawFailureResponse);
    
    await act(async () => { 
      render(
        <Provider store={store}>
          <MemoryRouter>
            <Withdrawals handleNavToTrxHist={mockHandleNavToTrxHist}/>
          </MemoryRouter>
        </Provider>
      );
    });

    const withdrawalInput = screen.getByRole('textbox', { name: /Withdraw from OasisBet Account:/i });
    const passwordInput = screen.getByLabelText(/Enter OasisBet Account password:/i);
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    await user.type(withdrawalInput, '1000');
    await user.type(passwordInput, 'incorrectPassword');
    await user.click(confirmButton);
    const withdrawalHeader = screen.queryByRole('heading', { name: /Are you sure to withdraw?/i });
    expect(withdrawalHeader).toBeDefined();
    const confirmDialogButton = screen.getByTestId('dialog-confirm')
    await user.click(confirmDialogButton);
    await waitFor(() => {
      const errorMessage = screen.getByText(/The withdrawal amount is more than the current account balance/i);
      expect(errorMessage).toBeDefined();
    });
  });

});