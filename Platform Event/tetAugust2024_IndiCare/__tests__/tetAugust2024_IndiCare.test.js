import { createElement } from 'lwc';
import TetAugust2024_IndiCare from 'c/tetAugust2024_IndiCare';

describe('c-tet-august2024-indi-care', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('TODO: test case generated by CLI command, please fill in test logic', () => {
        // Arrange
        const element = createElement('c-tet-august2024-indi-care', {
            is: TetAugust2024_IndiCare
        });

        // Act
        document.body.appendChild(element);

        // Assert
        // const div = element.shadowRoot.querySelector('div');
        expect(1).toBe(1);
    });
});