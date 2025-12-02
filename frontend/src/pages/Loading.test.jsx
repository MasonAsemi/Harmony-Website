import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import { API_BASE_URL } from '../config'
import Login from './Login'

// navigate mock
const mockNavigate = vi.fn();

// search params (mutated each test)
let mockSearchParams = new URLSearchParams();

// mock react-router-dom hooks
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams],
    };
});

const mockLogin = vi.fn();
const mockLoginToken = vi.fn();

vi.mock('../components/auth/AuthContext', () => ({
    useAuth: () => ({
        user: {id: 0, username: "TESTUSER"}, 
        login: mockLogin,
        loginToken: mockLoginToken,
    }),
}));

describe('Login component', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockLogin.mockReset();
        mockLoginToken.mockReset();
        mockSearchParams = new URLSearchParams('');
        vi.useRealTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const renderComponent = () => {
        return render(<Login />);
    };

    test('renders username and password fields and submit button', () => {
        renderComponent();

        const usernameField = screen.getByPlaceholderText('Username');
        const passwordField = screen.getByPlaceholderText('Password');
        const loginButton = screen.getByRole('button', { name: /^login$/i });
        const spotifyLoginButton = screen.getByRole('button', { name: /login with spotify/i });

        expect(usernameField).toBeInTheDocument();
        expect(passwordField).toBeInTheDocument();
        expect(loginButton).toBeInTheDocument();
        expect(spotifyLoginButton).toBeInTheDocument();
    });

    test('calls login and navigates on successful form submit', async () => {
        vi.useFakeTimers();
        mockLogin.mockResolvedValueOnce({ id: 0, username: 'TESTUSER' });

        renderComponent();

        const usernameInput = screen.getByPlaceholderText(/username/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        const button = screen.getByRole('button', { name: /^login$/i });

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('testuser', 'password');
        });

        expect(
            await screen.findByText(/login successful! redirecting/i)
        ).toBeInTheDocument();

        vi.runAllTimers();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    test('shows error message on login failure', async () => {
        mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

        renderComponent();

        const usernameInput = screen.getByPlaceholderText(/username/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        const button = screen.getByRole('button', { name: /^login$/i });

        fireEvent.change(usernameInput, { target: { value: 'baduser' } });
        fireEvent.change(passwordInput, { target: { value: 'badpass' } });
        fireEvent.click(button);

        expect(
            await screen.findByText(/invalid credentials/i)
        ).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('disables inputs and button while loading', async () => {
        let resolveLogin;
        const promise = new Promise((resolve) => {
            resolveLogin = resolve;
        });
        mockLogin.mockReturnValueOnce(promise);

        renderComponent();

        const usernameInput = screen.getByPlaceholderText(/username/i);
        const passwordInput = screen.getByPlaceholderText(/password/i);
        const button = screen.getByRole('button', { name: /^login$/i });

        fireEvent.change(usernameInput, { target: { value: 'user' } });
        fireEvent.change(passwordInput, { target: { value: 'pass' } });
        fireEvent.click(button);

        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent(/logging in/i);

        // resolve the pending login
        resolveLogin();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

    test('redirects to Spotify OAuth on click', () => {
        const originalLocation = window.location;
        delete window.location;
        window.location = { href: '' };

        renderComponent();

        const spotifyButton = screen.getByRole('button', { name: /login with spotify/i });
        fireEvent.click(spotifyButton);

        expect(window.location.href).toBe(
            `${API_BASE_URL}/api/spotify-auth/login/`
        );

        window.location = originalLocation;
    });

    test('logs in via Spotify token in URL and navigates', async () => {
        vi.useFakeTimers();

        mockSearchParams = new URLSearchParams('token=spotify-token');
        mockLoginToken.mockResolvedValueOnce(undefined);

        renderComponent();

        await waitFor(() => {
            expect(mockLoginToken).toHaveBeenCalledWith('spotify-token');
        });

        expect(
            screen.getByText(/logging in with spotify/i)
        ).toBeInTheDocument();

        expect(
            await screen.findByText(/login successful! redirecting/i)
        ).toBeInTheDocument();

        vi.runAllTimers();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });
});
