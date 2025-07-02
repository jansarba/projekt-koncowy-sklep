import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CartItem from '../CartItem';

describe('CartItem', () => {
  const mockOnRemove = jest.fn();
  const props = {
    cart_id: 1,
    beat_title: 'Test Beat',
    bpm: 120,
    musical_key: 'C Major',
    image_url: 'test.jpg',
    license_name: 'Basic License',
    license_price: 29.99,
    onRemove: mockOnRemove,
  };

  beforeEach(() => {
    mockOnRemove.mockClear();
  });

  it('renders the item details correctly', () => {
    render(<CartItem {...props} />);

    expect(screen.getByText('Test Beat')).toBeInTheDocument();
    expect(screen.getByText('120 BPM | C Major')).toBeInTheDocument();
    expect(screen.getByText('License: Basic License')).toBeInTheDocument();
    expect(screen.getByText('Price: $29.99')).toBeInTheDocument();
    expect(screen.getByAltText('Test Beat')).toHaveAttribute('src', 'test.jpg');
  });

  it('calls onRemove with the correct cart_id when the remove button is clicked', () => {
    render(<CartItem {...props} />);

    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledTimes(1);
    expect(mockOnRemove).toHaveBeenCalledWith(1);
  });

  it('uses a fallback image if image_url is not provided', () => {
    const propsWithoutImage = { ...props, image_url: undefined };
    render(<CartItem {...propsWithoutImage} />);

    expect(screen.getByAltText('Test Beat')).toHaveAttribute('src', '/default-image.jpg');
  });
});