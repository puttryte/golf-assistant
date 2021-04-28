import { render } from '@testing-library/react';
import Home from '../pages/Home';

test('has correct title', async () => {
    const { findAllByText } = render(<Home />);

    await findAllByText('PuttRyte');
});