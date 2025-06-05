import { render, screen } from '@testing-library/react';
import { Hello } from './Hello';

describe('Hello', () => {
  it('muestra el saludo con el nombre', () => {
    render(<Hello name="Mundo" />);
    expect(screen.getByText('Hola, Mundo!')).toBeInTheDocument();
  });
});