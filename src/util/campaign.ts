import { api } from "../web-models/api"
import { ICampaignMissionModel } from "../web-models/campaign"
import { showModal, showModalOk } from "./modal"
import { storage } from "./storage"

export function isInCampaign() {
    const arenaType = localStorage.getItem("gameType")
    return arenaType == 'campaign'
}

export async function getCurrentMission(): Promise<ICampaignMissionModel> {
    const campaignMissions = await api.getCampaignMissions()
    const missionName = storage.getMission()
    if (!missionName)
        return campaignMissions.first()
    const mission = campaignMissions.find(cm => cm.name == missionName)
    if (mission)
        return mission
    return campaignMissions.first()
}

export async function processCampaignGame(won: boolean) {
    showModal()
    if (won) {
        const campaignMissions = await api.getCampaignMissions()
        const missionName = storage.getMission()
        const missionNo = campaignMissions.findIndex(m => m.name == missionName)
        if (missionNo == campaignMissions.length - 1) {
            await showModalOk('Campaign is completed!')
            storage.setMission('')
            window.location.href = '/'
            return
        }
        if (missionNo >= 0 && missionNo < campaignMissions.length - 1) {
            const nextMission = campaignMissions[missionNo + 1]
            storage.setMission(nextMission.name)
        }
    }
    window.location.href = '/campaign'
}

export function setCampaignMode(on: boolean) {
    localStorage.setItem("gameType", on ? 'campaign' : '')
}