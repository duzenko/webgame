import { getCurrentMission, setCampaignMode } from "../util/campaign"
import { storage } from "../util/storage"

const titleHeading = document.getElementById('title') as HTMLHeadingElement
const storyDiv = document.getElementById('story') as HTMLDivElement

export async function loadCampaignPage() {
    setCampaignMode(true)
    const mission = await getCurrentMission()
    storage.setMission(mission.name)
    titleHeading.textContent = mission.title
    const response = await fetch(`/data/campaign/${mission.name}/story.html`)
    const story = await response.text()
    storyDiv.innerHTML = story
}
