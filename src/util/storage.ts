class Storage {
    getMission() {
        return localStorage.getItem("mission")
    }
    setMission(name: string) {
        localStorage.setItem("mission", name)
    }
}

export const storage = new Storage()