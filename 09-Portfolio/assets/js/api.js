
async function fetchProfileData() {
    const url = 'https://raw.githubusercontent.com/flima04/Bootcamp-Frontend-SantanderOpenAcademy/refs/heads/main/09-Portfolio/data/profile.json';
    const response = await fetch(url)
    const profileData = await response.json()
    return profileData
}
