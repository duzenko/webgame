import { setCampaignMode } from "../util/campaign"

async function loadMenuPage() {
    setCampaignMode(false)
}

const _global = (window /* browser */ || global /* node */) as any
_global.loadMenuPage = loadMenuPage
