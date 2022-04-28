import {useState, useEffect} from 'react';
import {EditablePage,EditorContextHelper} from '@magnolia/react-editor';
import Navigation from '../templates/components/Navigation';
import Basic from '../templates/pages/Basic';
import Contact from '../templates/pages/Contact';
import Headline from '../templates/components/Headline';
import Image from '../templates/components/Image';
import Paragraph from '../templates/components/Paragraph';
import Expander from '../templates/components/Expander';
import List from '../templates/components/List';
import Item from '../templates/components/Item';
import {languages, getCurrentLanguage, setURLSearchParams} from '../utils';


const nodeName = '/nextjs-ssr-minimal';
// Configuration object containing the componentMappings object with mappings between the mgnl:template values and React components.
const config = {
    componentMappings: {
        'nextjs-ssr-minimal-lm:pages/basic': Basic,
        'nextjs-ssr-minimal-lm:pages/contact': Contact,

        'spa-lm:components/headline': Headline,
        'spa-lm:components/image': Image,
        'spa-lm:components/paragraph': Paragraph,
        'spa-lm:components/expander': Expander,
        'spa-lm:components/list': List,
        'spa-lm:components/listItem': Item,
    },
};

/*
 * GREEN BARS:
 * Source doc: https://docs.magnolia-cms.com/product-docs/6.2/Developing/SPA-development-and-Magnolia/Magnolia-front-end-helpers-for-SPA/Magnolia-React-Editor.html
 * Template information required for the Page Editor to create the authoring UI (the green bars).
 * templateAnnotations are fetched from <MAGNOLIA_INSTANCE>/.rest/template-annotations/v1/<PAGE_PATH>
 * Example: https://demo.magnolia-cms.com/.rest/template-annotations/v1/travel
 * templateDefinitions are fetched from <MAGNOLIA_INSTANCE>/.rest/template-definitions/v1/<PAGE_TEMPLATE>
 * Example: https://demo.magnolia-cms.com/.rest/template-definitions/v1/travel-demo:pages/home
 */

// Use different defaultBaseUrl to point to public instances
const defaultBaseUrl = process.env.NEXT_PUBLIC_MGNL_HOST;
const pagesApi = defaultBaseUrl + '/.rest/delivery/pages/v1';
const templateAnnotationsApi = defaultBaseUrl + '/.rest/template-annotations/v1';
const pagenavApi = defaultBaseUrl + '/.rest/delivery/pagenav/v1';

// More info about personalization of headless projects https://docs.magnolia-cms.com/product-docs/6.2/Developing/SPA-development-and-Magnolia/Personalization-of-headless-SPA-projects.html
// Fetch all variants inside Magnolia WYSIWYG in edit mode
function p13n(pagePath, isPagesAppEdit) {
    let newPagePath = pagePath;

    if (isPagesAppEdit) {
        newPagePath += newPagePath.indexOf('?') > -1 ? '&' : '?';
        newPagePath += 'variants=all';
    }

    return newPagePath;
}

export async function getServerSideProps(context) {
    const resolvedUrl = context.resolvedUrl;
    const currentLanguage = getCurrentLanguage(resolvedUrl);
    const isDefaultLanguage = currentLanguage === languages[0];
    const isPagesApp = context.query?.mgnlPreview || null;
    let props = {
        isPagesApp,
        isPagesAppEdit: isPagesApp === 'false',
        basename: isDefaultLanguage ? '' : '/' + currentLanguage,
        pagePath: nodeName + context.resolvedUrl.replace(new RegExp('.*' + nodeName), ''), // Find out page path to fetch from Magnolia
    };

    global.mgnlInPageEditor = props.isPagesAppEdit;

    if (!isDefaultLanguage) {
        props.pagePath = props.pagePath.replace('/' + currentLanguage, '');
    }

    // Fetching page content
    const pagesRes = await fetch(
        p13n(setURLSearchParams(pagesApi + props.pagePath, 'lang=' + currentLanguage), props.isPagesAppEdit)
    );
    props.page = await pagesRes.json();

    // Fetching page navigation
    const pagenavRes = await fetch(setURLSearchParams(pagenavApi + nodeName, 'lang=' + currentLanguage));
    props.pagenav = await pagenavRes.json();

    return {
        props,
    };
}

export default function Pathname(props) {
    const [templateAnnotations, setTemplateAnnotations] = useState();
    const {page, pagenav, isPagesApp, isPagesAppEdit, basename, pagePath} = props;

    // Fetch template annotations only inside Magnolia WYSIWYG
    useEffect(() => {
        async function fetchTemplateAnnotations() {
            console.log('fetching template annotations')
            const templateAnnotationsRes = await fetch(templateAnnotationsApi + pagePath);
            const templateAnnotationsJson = await templateAnnotationsRes.json();
            console.log(templateAnnotationsRes)
            setTemplateAnnotations(templateAnnotationsJson);
        }

        console.log(`values for pages app are: app: ${isPagesApp} appEdit: ${isPagesAppEdit}`)
        if (isPagesApp) fetchTemplateAnnotations();
    }, [isPagesApp, pagePath]);
    // if (isPagesApp || isPagesAppEdit) fetchTemplateAnnotations();
    // }, [isPagesApp,isPagesAppEdit, pagePath]);

    // In Pages app wait for template annotations before rendering EditablePage
    const shouldRenderEditablePage = page && (isPagesApp ? templateAnnotations : true);
    console.log(`Should render editable page with this info:`)
    console.log(shouldRenderEditablePage)
    return (
        <div className={isPagesAppEdit ? 'disable-a-pointer-events' : ''}>
            {pagenav && <Navigation content={pagenav} nodeName={nodeName} basename={basename}/>}
            {shouldRenderEditablePage && (
                <EditablePage content={page} config={config} templateAnnotations={templateAnnotations}/>
            )}
        </div>
    );
}
