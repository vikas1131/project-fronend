import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import sinon from "sinon";
import PageNotFound from "../components/PageNotFound"; // Adjust path if needed

describe("PageNotFound Component", () => {
  let wrapper;
  let historyBackStub, locationReloadStub;
  let clock;

  before(() => {
    // Use fake timers to control setTimeout
    clock = sinon.useFakeTimers();
  });

  after(() => {
    clock.restore();
  });

  beforeEach(() => {
    // Stub window.history.back and window.location.reload to test their calls
    historyBackStub = sinon.stub(window.history, "back");
    locationReloadStub = sinon.stub(window.location, "reload");
    wrapper = mount(<PageNotFound />);
  });

  afterEach(() => {
    historyBackStub.restore();
    locationReloadStub.restore();
    wrapper.unmount();
  });

  it("renders the header and message", () => {
    expect(wrapper.find("h1").text()).to.equal("404");
    expect(wrapper.find("span").text()).to.equal("Oops! Page Not Found");
  });

  it("displays the image with bounce animation when isAnimating is true", () => {
    const img = wrapper.find("img");
    expect(img.hasClass("animate-bounce")).to.be.true;
  });

  it("calls handleGoBack when the Go Back button is clicked", () => {
    wrapper.find('button[data-test="go-back"]').simulate("click");
    expect(historyBackStub.calledOnce).to.be.true;
  });

  it("calls handleRefresh when the Refresh button is clicked", () => {
    wrapper.find('button[data-test="refresh"]').simulate("click");
    expect(locationReloadStub.calledOnce).to.be.true;
  });

  it("updates countdown over time", () => {
    const initialHTML = wrapper.html();
    clock.tick(3000); // advance 3 seconds
    wrapper.update();
    // Even though countdown is not displayed, we verify the component still renders.
    expect(wrapper.html()).to.not.equal(initialHTML);
  });
});