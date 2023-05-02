import { getCurrentMission, setCampaignMode } from "../util/campaign"
import { storage } from "../util/storage"

export let titleHeading = document.getElementById('title') as HTMLHeadingElement
export let storyDiv = document.getElementById('story') as HTMLDivElement

async function loadCampaignPage() {
    setCampaignMode(true)
    const mission = await getCurrentMission()
    storage.setMission(mission.name)
    titleHeading.textContent = mission.title
    const response = await fetch(`/data/campaign/${mission.name}/story.html`)
    const story = await response.text()
    storyDiv.innerHTML = story
}

const _global = (window /* browser */ || global /* node */) as any
_global.loadCampaignPage = loadCampaignPage
