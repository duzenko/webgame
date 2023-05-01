import { ICampaignMissionModel } from "./campaign"


class Api {
    async getCampaignMissions(): Promise<ICampaignMissionModel[]> {
        const response = await fetch('/data/campaign/missions.json')
        return await response.json() as ICampaignMissionModel[]
    }
}

export const api = new Api()