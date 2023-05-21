import { loadArena } from './pages/arena'
import { loadCampaignPage } from './pages/campaign'
import { loadMenuPage } from './pages/menu'

const routes: {
    [key: string]: () => void
} = {
    '/': loadMenuPage,
    '/campaign/': loadCampaignPage,
    '/arena/': loadArena,
}
const route = routes[document.location.pathname]
if (!route) throw Error(`Unknown route ${document.location.pathname}`)
route()