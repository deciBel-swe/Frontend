import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EmailInput from '@/features/auth/components/FormFields/EmailInput';
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import FloatingSelectField from '@/features/auth/components/FormFields/FloatingSelectField';
import PasswordInput from '@/features/auth/components/FormFields/PasswordInput';

describe('auth form fields', () => {
  it('calls EmailInput onFocus and onChange', async () => {
    const user = userEvent.setup();
    const onFocus = jest.fn();
    const onChange = jest.fn();

    render(
      <EmailInput
        value=""
        onChange={onChange}
        onFocus={onFocus}
        label="Email"
      />
    );

    const input = screen.getByRole('textbox');

    await user.click(input);
    await user.type(input, 'a');

    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('a');
    expect(input).toHaveAttribute('autocomplete', 'email');
  });

  it('renders FloatingInputField error and emits onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <FloatingInputField
        label="Display name"
        value=""
        onChange={onChange}
        error="Display name is required"
      />
    );

    await user.type(screen.getByRole('textbox'), 'D');

    expect(screen.getByText('Display name is required')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('D');
  });

  it('calls FloatingSelectField onChange and renders placeholder option', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <FloatingSelectField
        label="Month"
        value=""
        onChange={onChange}
        placeholder="Select month"
        options={[
          { value: '01', label: 'January' },
          { value: '02', label: 'February' },
        ]}
      />
    );

    const select = screen.getByRole('combobox');
    const placeholder = screen.getByRole('option', { name: 'Select month' });

    expect(placeholder).toBeDisabled();

    await user.selectOptions(select, '02');

    expect(onChange).toHaveBeenCalledWith('02');
  });

  it('shows FloatingSelectField label only when value exists', () => {
    const onChange = jest.fn();

    const { rerender } = render(
      <FloatingSelectField
        label="Month"
        value=""
        onChange={onChange}
        options={[{ value: '01', label: 'January' }]}
      />
    );

    expect(screen.queryByText('Month')).not.toBeInTheDocument();

    rerender(
      <FloatingSelectField
        label="Month"
        value="01"
        onChange={onChange}
        options={[{ value: '01', label: 'January' }]}
      />
    );

    expect(screen.getByText('Month')).toBeInTheDocument();
  });

  it('toggles PasswordInput visibility and emits onChange', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    const { container } = render(
      <PasswordInput label="Password" value="" onChange={onChange} />
    );

    const input = container.querySelector('input');

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button'));

    expect(input).toHaveAttribute('type', 'text');

    await user.type(input as HTMLInputElement, 'x');

    expect(onChange).toHaveBeenCalledWith('x');
  });
});
