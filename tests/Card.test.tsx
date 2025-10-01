import { render, screen, fireEvent } from '@testing-library/react'
import Card from '@/components/card'
import '@testing-library/jest-dom'

// Mock the utils function
jest.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' ')
}))

describe('Card Component', () => {
  const mockProps = {
    title: 'Nike Air Max 90',
    description: 'Classic Nike sneakers with Air Max technology',
    price: 120.00,
    imageUrl: '/test-image.jpg',
    imageAlt: 'Nike Air Max 90 sneakers',
    category: 'Sneakers',
  }

  it('renders card with basic information', () => {
    render(<Card {...mockProps} />)

    expect(screen.getByText('Nike Air Max 90')).toBeInTheDocument()
    expect(screen.getByText('Classic Nike sneakers with Air Max technology')).toBeInTheDocument()
    expect(screen.getByText('$120.00')).toBeInTheDocument()
    expect(screen.getByText('Sneakers')).toBeInTheDocument()
    expect(screen.getByAltText('Nike Air Max 90 sneakers')).toBeInTheDocument()
  })

  it('displays sale badge and discount when on sale', () => {
    const saleProps = {
      ...mockProps,
      originalPrice: 150.00,
      isSale: true,
    }

    render(<Card {...saleProps} />)

    expect(screen.getByText('Sale')).toBeInTheDocument()
    expect(screen.getByText('$150.00')).toBeInTheDocument()
    expect(screen.getByText('20% off')).toBeInTheDocument()
  })

  it('displays new badge when item is new', () => {
    const newProps = {
      ...mockProps,
      isNew: true,
    }

    render(<Card {...newProps} />)

    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('displays colors when provided', () => {
    const colorProps = {
      ...mockProps,
      colors: ['red', 'blue', 'green'],
    }

    render(<Card {...colorProps} />)

    expect(screen.getByText('Colors:')).toBeInTheDocument()
    // Check if color divs are rendered (they have style backgroundColor)
    const colorDivs = screen.getAllByTitle(/red|blue|green/i)
    expect(colorDivs).toHaveLength(3)
  })

  it('displays sizes when provided', () => {
    const sizeProps = {
      ...mockProps,
      sizes: ['8', '9', '10', '11'],
    }

    render(<Card {...sizeProps} />)

    expect(screen.getByText('Sizes:')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockAddToCart = jest.fn()
    const cartProps = {
      ...mockProps,
      onAddToCart: mockAddToCart,
    }

    render(<Card {...cartProps} />)

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('calls onToggleFavorite when favorite button is clicked', () => {
    const mockToggleFavorite = jest.fn()
    const favoriteProps = {
      ...mockProps,
      onToggleFavorite: mockToggleFavorite,
      isFavorite: false,
    }

    render(<Card {...favoriteProps} />)

    const favoriteButton = screen.getByLabelText('Add to favorites')
    fireEvent.click(favoriteButton)

    expect(mockToggleFavorite).toHaveBeenCalledTimes(1)
  })

  it('shows correct favorite button state when item is favorited', () => {
    const favoriteProps = {
      ...mockProps,
      onToggleFavorite: jest.fn(),
      isFavorite: true,
    }

    render(<Card {...favoriteProps} />)

    expect(screen.getByLabelText('Remove from favorites')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    const linkProps = {
      ...mockProps,
      href: '/product/nike-air-max-90',
    }

    render(<Card {...linkProps} />)

    const linkElement = screen.getByRole('link')
    expect(linkElement).toHaveAttribute('href', '/product/nike-air-max-90')
  })

  it('does not render add to cart button when onAddToCart is not provided', () => {
    render(<Card {...mockProps} />)

    expect(screen.queryByText('Add to Cart')).not.toBeInTheDocument()
  })

  it('does not render favorite button when onToggleFavorite is not provided', () => {
    render(<Card {...mockProps} />)

    expect(screen.queryByLabelText(/favorites/i)).not.toBeInTheDocument()
  })
})
