import { findByText, render } from '@testing-library/react';
import Home from '../pages/Home';

test('has correct title', async () => {
    const { findAllByText } = render(<Home />);

    await findAllByText('PuttRyte');
});

test('has SINGLE and ENDLESS buttons on home page', async () => {
    const { findByText } = render(<Home />);

    await findByText('SINGLE');
    await findByText('ENDLESS');
});