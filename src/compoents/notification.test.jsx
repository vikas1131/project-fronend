import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import sinon from "sinon";
import * as reactRedux from "react-redux";
import Notifications from "../components/notification"; // Adjust path if needed
import { fetchNotifications, markAsRead } from "../redux/Slice/notificationSlice";

describe("Notifications Component", () => {
  let useDispatchStub;
  let useSelectorStub;
  let dispatchSpy;

  beforeEach(() => {
    // Stub useDispatch and useSelector from react-redux
    dispatchSpy = sinon.spy();
    useDispatchStub = sinon.stub(reactRedux, "useDispatch").returns(dispatchSpy);
    // Clear sessionStorage for each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("dispatches fetchNotifications on mount when email exists in sessionStorage", () => {
    sessionStorage.setItem("email", "test@example.com");
    useSelectorStub = sinon.stub(reactRedux, "useSelector").callsFake((selector) =>
      selector({
        notifications: [],
        loading: false,
      })
    );

    mount(<Notifications />);
    // Expect fetchNotifications to be dispatched with the stored email.
    expect(dispatchSpy.calledWith(fetchNotifications("test@example.com"))).to.be.true;
  });

  it("does not dispatch fetchNotifications when email is not set", () => {
    // No email is stored in sessionStorage.
    useSelectorStub = sinon.stub(reactRedux, "useSelector").callsFake((selector) =>
      selector({
        notifications: [],
        loading: false,
      })
    );
    mount(<Notifications />);
    // Ensure that no action with type "notifications/fetchNotifications" is dispatched.
    expect(
      dispatchSpy.calledWith(sinon.match.has("type", "notifications/fetchNotifications"))
    ).to.be.false;
  });

  it("renders loading state when loading is true", () => {
    sessionStorage.setItem("email", "test@example.com");
    useSelectorStub = sinon.stub(reactRedux, "useSelector").callsFake((selector) =>
      selector({
        notifications: [],
        loading: true,
      })
    );
    const wrapper = mount(<Notifications />);
    expect(wrapper.text()).to.contain("Loading...");
  });

  it('renders "No new notifications" when not loading and notifications array is empty', () => {
    sessionStorage.setItem("email", "test@example.com");
    useSelectorStub = sinon.stub(reactRedux, "useSelector").callsFake((selector) =>
      selector({
        notifications: [],
        loading: false,
      })
    );
    const wrapper = mount(<Notifications />);
    expect(wrapper.text()).to.contain("No new notifications");
  });

  it("renders notifications and dispatches markAsRead when the button is clicked", () => {
    sessionStorage.setItem("email", "test@example.com");
    const notificationsData = [
      { _id: "1", message: "Notification 1" },
      { _id: "2", message: "Notification 2" },
    ];
    useSelectorStub = sinon.stub(reactRedux, "useSelector").callsFake((selector) =>
      selector({
        notifications: notificationsData,
        loading: false,
      })
    );
    const wrapper = mount(<Notifications />);
    // Verify that the notification messages are rendered.
    expect(wrapper.text()).to.contain("Notification 1");
    expect(wrapper.text()).to.contain("Notification 2");
    // Assume each notification renders a button with text "Mark as Read"
    const buttons = wrapper.find("button").filterWhere((n) => n.text() === "Mark as Read");
    expect(buttons).to.have.lengthOf(2);
    // Simulate clicking the first button.
    buttons.at(0).simulate("click");
    // Verify that dispatch was called with markAsRead for the first notification.
    expect(dispatchSpy.calledWith(markAsRead("1"))).to.be.true;
  });
});