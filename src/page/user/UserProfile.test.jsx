import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import UserProfile from "./UserProfile";
import { fetchProfile, fetchUpdateProfile } from "../../redux/Slice/UserSlice";
import { validateEmail, validatePhoneNumber } from "../../utils/validation";

jest.mock("../../redux/Slice/UserSlice", () => ({
  fetchProfile: jest.fn(),
  fetchUpdateProfile: jest.fn(),
}));

jest.mock("../../utils/validation", () => ({
  validateEmail: jest.fn(),
  validatePhoneNumber: jest.fn(),
}));

const mockStore = configureStore([]);

describe("UserProfile Component", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      tickets: {
        profile: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "1234567890",
          address: "123 Street, City",
        },
      },
    });
    store.dispatch = jest.fn();
  });

  test("renders UserProfile component", () => {
    render(
      <Provider store={store}>
        <UserProfile />
      </Provider>
    );
    expect(screen.getByText(/Your Profile/i)).toBeInTheDocument();
  });

  //   render(
  //     <Provider store={store}>
  //       <UserProfile />
  //     </Provider>
  //   );
  //   await waitFor(() => {
  //     expect(fetchProfile).toHaveBeenCalled();
  //   });
  // });

  test("displays user profile information", () => {
    render(
      <Provider store={store}>
        <UserProfile />
      </Provider>
    );
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("123 Street, City")).toBeInTheDocument();
  });


  //   render(
  //     <Provider store={store}>
  //       <UserProfile />
  //     </Provider>
  //   );
  //   fireEvent.click(screen.getByText(/Update Profile/i));
    
  //   const nameInput = screen.getByLabelText(/Full Name/i);
  //   fireEvent.change(nameInput, { target: { value: "Jane Doe" } });
  //   expect(nameInput.value).toBe("Jane Doe");
  // });

  test("validates email and phone number before submission", async () => {
    validateEmail.mockReturnValue(false);
    validatePhoneNumber.mockReturnValue(false);
    render(
      <Provider store={store}>
        <UserProfile />
      </Provider>
    );
    fireEvent.click(screen.getByText(/Update Profile/i));
    fireEvent.click(screen.getByText(/Save Changes/i));
    
    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid phone number/i)).toBeInTheDocument();
    });
  });

  test("submits form when valid and updates profile", async () => {
    validateEmail.mockReturnValue(true);
    validatePhoneNumber.mockReturnValue(true);
    fetchUpdateProfile.mockResolvedValue({});
    
    render(
      <Provider store={store}>
        <UserProfile />
      </Provider>
    );
    fireEvent.click(screen.getByText(/Update Profile/i));
    fireEvent.click(screen.getByText(/Save Changes/i));

    await waitFor(() => {
      expect(fetchUpdateProfile).toHaveBeenCalled();
      expect(screen.getByText(/Profile Updated!/i)).toBeInTheDocument();
    });
  });
});