import { GOOGLE_ANALYTICS_ID } from '../../../config/env';

const createFontAweScript = () => `<script src="https://kit.fontawesome.com/23b277731a.js"></script>`;
const createAppScript = () => '<script async type="text/javascript" charset="utf-8" src="/assets/app.js"></script>';
const createVendorScript = () => '';

const createAnalyticsSnippet = (id) => `<script>
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', '${id}', 'auto');
ga('send', 'pageview');
</script>
<script async src='https://www.google-analytics.com/analytics.js'></script>`;

const createTrackingScript = () => (GOOGLE_ANALYTICS_ID ? createAnalyticsSnippet(GOOGLE_ANALYTICS_ID) : '');

const createStylesheets = () => `
    <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet"/>    
`;  

export {
 createAppScript, createVendorScript, createTrackingScript, createStylesheets, createFontAweScript
};
