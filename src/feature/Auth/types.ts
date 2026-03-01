export interface AuthProps {
  onClose: () => void;
}

export interface SignupModalProps extends AuthProps {
  onLoginOpen: () => void;
}

export interface LoginModalProps extends AuthProps {
  onSignupOpen: () => void;
}
