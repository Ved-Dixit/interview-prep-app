import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  test('renders with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    render(<LoadingSpinner message="Processing your request..." />);
    expect(screen.getByText('Processing your request...')).toBeInTheDocument();
  });

  test('renders with small size', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    expect(container.querySelector('.loading-spinner-small')).toBeInTheDocument();
  });

  test('renders with medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.loading-spinner-medium')).toBeInTheDocument();
  });

  test('renders with large size', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    expect(container.querySelector('.loading-spinner-large')).toBeInTheDocument();
  });

  test('renders inline by default', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.loading-spinner-overlay')).not.toBeInTheDocument();
  });

  test('renders as full screen overlay when fullScreen is true', () => {
    const { container } = render(<LoadingSpinner fullScreen={true} />);
    expect(container.querySelector('.loading-spinner-overlay')).toBeInTheDocument();
  });

  test('has proper ARIA attributes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  test('renders without message when message is empty', () => {
    const { container } = render(<LoadingSpinner message="" />);
    expect(container.querySelector('.loading-message')).not.toBeInTheDocument();
  });
});
