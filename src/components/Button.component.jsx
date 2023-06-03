import '../styles/Button.scss';

const BUTTON_VARIANT_CLASSES = {
    primary: 'primary',
    light: 'light',
    add: 'add',
    modalInput: 'modal-input',
    modalToggle: 'modal-toggle'
}

const Button = ({children, variant="primary"}) => {
    return <button className={`button-container ${BUTTON_VARIANT_CLASSES[variant]}`}>{children}</button>;
}
 
export default Button;