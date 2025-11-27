import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  test('renders error message', () => {
    render(<ErrorMessage message="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  test('does not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  test('renders with error type by default', () => {
    const { container } = render(<ErrorMessage message="Error" />);
    expect(container.querySelector('.error-message-error')).toBeInTheDocument();
  });

  test('renders with warning type', () => {
    const { container } = render(<ErrorMessage message="Warning" type="warning" />);
    expect(container.querySelector('.error-message-warning')).toBeInTheDocument();
  });

  test('renders with info type', () => {
    const { container } = render(<ErrorMessage message="Info" type="info" />);
    expect(container.querySelector('.error-message-info')).toBeInTheDocument();
  });

  test('shows dismiss button when onDismiss is provided', () => {
    const handleDismiss = jest.fn();
    render(<ErrorMessage message="Test" onDismiss={handleDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss error');
    expect(dismissButton).toBeInTheDocument();
  });

  test('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = jest.fn();
    render(<ErrorMessage message="Test" onDismiss={handleDismiss} />);
    
    const dismissButton = screen.getByLabelText('Dismiss error');
    fireEvent.click(dismissButton);
    
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  test('does not show dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage message="Test" />);
    
    const dismissButton = screen.queryByLabelText('Dismiss error');
    expect(dismissButton).not.toBeInTheDocument();
  });

  test('has proper ARIA role', () => {
    render(<ErrorMessage message="Test" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
