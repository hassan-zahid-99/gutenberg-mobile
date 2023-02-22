/**
 * Internal dependencies
 */
const { blockNames } = editorPage;
const { isAndroid, setThemeJSONFromClipboard, swipeDown } = e2eUtils;
import { takeScreenshot } from './utils';

function getThemeLink( theme ) {
	if ( theme.isWordPress ) {
		return `https://raw.githubusercontent.com/WordPress/${ theme.name }/trunk/theme.json`;
	}

	return `https://raw.githubusercontent.com/Automattic/themes/trunk/${ theme.name }/theme.json`;
}

describe( 'Gutenberg Editor - Block based themes', () => {
	[
		{ name: 'pixl' },
		{ name: 'masu' },
		{ name: 'bitacora' },
		{ name: 'twentytwentythree', isWordPress: true },
	].forEach( ( currentTheme ) =>
		describe( `For theme: ${ currentTheme.name }`, () => {
			let themeData;

			beforeAll( async () => {
				const themeJSONLink = getThemeLink( currentTheme );

				await fetch( themeJSONLink )
					.then( ( response ) => response.json() )
					.then( ( data ) => {
						themeData = JSON.stringify( data );
					} );

				await setThemeJSONFromClipboard( editorPage.driver, themeData );
			} );

			it( 'Renders theme colors and font sizes correctly', async () => {
				await editorPage.addNewBlock( blockNames.paragraph );
				let paragraphBlockElement = await editorPage.getTextBlockAtPosition(
					blockNames.paragraph
				);
				if ( isAndroid() ) {
					await paragraphBlockElement.click();
				}

				await editorPage.sendTextToParagraphBlock(
					1,
					e2eTestData.longText
				);

				// Select title to unfocus the block
				const titleElement = await editorPage.getTitleElement();
				titleElement.click();

				await editorPage.dismissKeyboard();
				// Wait for the keyboard to be hidden
				await editorPage.driver.sleep( 3000 );

				if ( ! isAndroid() ) {
					// To scroll to the very top
					await swipeDown( editorPage.driver );
				}

				// Visual test check
				const screenshot = await takeScreenshot();
				expect( screenshot ).toMatchImageSnapshot();

				// Remove blocks
				for ( let i = 3; i > 0; i-- ) {
					paragraphBlockElement = await editorPage.getTextBlockAtPosition(
						blockNames.paragraph
					);
					await paragraphBlockElement.click();
					await editorPage.removeBlock();
				}
			} );
		} )
	);
} );
