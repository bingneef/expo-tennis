import { Tournament } from './../models/Tournament'
import { Season } from './../models/Season'
import { Match } from './../models/ApiMatch'
import moment from 'moment'
import axios from 'axios'

import constants from '../config/constants'

const perform = async () => {
  try {
    const day = moment().subtract(1, 'd').format('YYYY-MM-DD')
    const token = constants.tokens.sportradar
    const url = `https://api.sportradar.com/tennis-t2/en/schedules/${day}/results.json?api_key=${token}`

    const response = await axios.get(url)

    for (let data of response.data.results) {
      if (data.sport_event.tournament.type == 'doubles' || data.sport_event.tournament_round.type == 'qualification') {
        continue
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
  if (!apiSeason) {
    return {}
  }
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

  let match = await Match.findOne({externalId: apiSportEvent.id})
  if (!match) {
    match = new Match()
  }

  let payload = {
    externalId: apiSportEvent.id,
    tournamentId,
    seasonId,
    round: {
      kind: apiSportEvent.tournament_round.type,
      name: apiSportEvent.tournament_round.name,
    },
    scheduled: apiSportEvent.schedules,
    status: apiSportEventStatus.status,
    matchStatus: apiSportEventStatus.match_status,
    homeScore: apiSportEventStatus.home_score,
    awayScore: apiSportEventStatus.away_score,
    winnerId: apiSportEventStatus.winner_id,
    competitors: prepCompetitors(apiSportEvent.competitors),
    periodScores: prepPeriodScores(apiSportEventStatus.period_scores),
  }

  if (apiSportEvent.venue) {
    payload = {
      ...payload,
      venue: {
        name: apiSportEvent.venue.name,
      },
    }
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
