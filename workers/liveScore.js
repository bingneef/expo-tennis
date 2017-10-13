import { Tournament } from './../models/Tournament'
import { Season } from './../models/Season'
import { Match } from './../models/ApiMatch'

const perform = async () => {
  try {
    await Tournament.remove()
    await Season.remove()
    await Match.remove()

    const response = require('./../data/liveScores.json').results
    for (let data of response) {
      if (data.sport_event.tournament.type == 'doubles' || data.sport_event.tournament_round.type == 'qualification') {
        continue;
      }

      const tournament = await saveTournament(data)
      const season = await saveSeason(data, tournament.id)
      await saveMatch(data, tournament.id, season.id)
    }

    if (!module.parent) process.exit(0)
  } catch (e) {
    console.error(e)
    if (!module.parent) process.exit(1)
  }
}

const saveTournament = async (data) => {
  const apiTournament = data.sport_event.tournament
  let tournament = await Tournament.findOne({externalId: apiTournament.id})
  if (!tournament) {
    tournament = new Tournament()
  }

  const payload = {
    externalId: apiTournament.id,
    name: apiTournament.name,
    kind: apiTournament.type,
    gender: apiTournament.gender,
  }

  tournament.set(payload)
  return tournament.save()
}

const saveSeason = async (data, tournamentId) => {
  const apiSeason = data.sport_event.season
  let season = await Season.findOne({externalId: apiSeason.id})[0]
  if (!season) {
    season = new Season()
  }

  const payload = {
    externalId: apiSeason.id,
    tournamentId,
    name: apiSeason.name,
    startDate: apiSeason.start_date,
    endDate: apiSeason.end_date,
    year: apiSeason.year,
  }

  season.set(payload)
  return season.save()
}

const saveMatch = async (data, tournamentId, seasonId) => {
  const apiSportEvent = data.sport_event
  const apiSportEventStatus = data.sport_event_status

  let match = await Match.findOne({externalId: apiSportEvent.id})[0]
  if (!match) {
    match = new Match()
  }

  const payload = {
    externalId: apiSportEvent.id,
    tournamentId,
    seasonId,
    scheduled: apiSportEvent.schedules,
    status: apiSportEventStatus.status,
    matchStatus: apiSportEventStatus.match_status,
    homeScore: apiSportEventStatus.home_score,
    awayScore: apiSportEventStatus.away_score,
    winnerId: apiSportEventStatus.winner_id,
    competitors: prepCompetitors(apiSportEvent.competitors),
    periodScores: prepPeriodScores(apiSportEventStatus.period_scores),
  }

  match.set(payload)
  return match.save()
}

const prepCompetitors = apiCompetitors => {
  let competitors = []
  for (let apiCompetitor of apiCompetitors) {
    const competitor = {
      externalId: apiCompetitor.id,
      name: apiCompetitor.name,
      abbreviation: apiCompetitor.abbreviation,
      team: apiCompetitor.qualifier,
      nationality: apiCompetitor.nationality,
      countryCode: apiCompetitor.country_code
    }
    competitors.push(competitor)
  }
  return competitors
}

const prepPeriodScores = apiPeriodScores => {
  if (!apiPeriodScores) {
    return []
  }

  let periodScores = []
  for (let apiPeriodScore of apiPeriodScores) {
    const periodScore = {
      homeScore: apiPeriodScore.home_score,
      awayScore: apiPeriodScore.away_score,
      number: apiPeriodScore.number,
    }
    periodScores.push(periodScore)
  }
  return periodScores
}

if (!module.parent) perform()
export default perform
