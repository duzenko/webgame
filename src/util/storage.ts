class Storage {
    getMission() {
        console.log('getMission', localStorage.getItem("mission"))
        return localStorage.getItem("mission")
    }
    setMission(name: string) {
        console.log('setMission', name)
        localStorage.setItem("mission", name)
    }
}

export const storage = new Storage()