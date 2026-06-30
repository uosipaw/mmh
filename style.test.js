/**
 * @jest-environment jsdom
 */

describe(".curtain-top CSS rule", () => {
  let curtainElement;

  beforeAll(() => {
    // Set up the document body with the element we want to test
    document.body.innerHTML = `
      <style>
        .curtain-top {
          position: absolute; /* position is needed for top/left/right */
          top: 0;
          left: 0;
          right: 0;
          z-index: 18;
          width: auto;
          height: 100%;
          object-fit: fill;
          object-position: top center;
          filter: drop-shadow(0 8px 0 rgba(23, 18, 15, 0.22));
          animation: topCurtainBreath 4.8s ease-in-out infinite;
        }
      </style>
      <img class="curtain-top" src="fake.png" alt="Test Curtain" />
    `;
    curtainElement = document.querySelector(".curtain-top");
  });

  it("should be positioned absolutely at the top", () => {
    const styles = window.getComputedStyle(curtainElement);
    expect(styles.position).toBe("absolute");
    expect(styles.top).toBe("0px");
    expect(styles.left).toBe("0px");
    expect(styles.right).toBe("0px");
  });

  it("should have the correct object-fit and z-index", () => {
    const styles = window.getComputedStyle(curtainElement);
    expect(styles.objectFit).toBe("fill");
    expect(styles.zIndex).toBe("18");
  });

  it("should apply the topCurtainBreath animation", () => {
    const styles = window.getComputedStyle(curtainElement);
    expect(styles.animationName).toBe("topCurtainBreath");
    expect(styles.animationDuration).toBe("4.8s");
    expect(styles.animationIterationCount).toBe("infinite");
  });
});
