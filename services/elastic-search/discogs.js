const elasticsearch = require('elasticsearch')

const winston = require('../logger')
const constants = require('../../config/constants')
const discogsIndex = constants.elasticSearch.discogs.index
const discogsHost = constants.elasticSearch.discogs.host

const client = new elasticsearch.Client({
  host: discogsHost,
})

const byReleaseId = async (releaseId) => {
  try {
    const query = {
      index: discogsIndex,
      body: {
        query: {
          match: {
            id: releaseId
          }
        }
      }
    }

    winston.info('Elastic::discogs - query', JSON.stringify(query))
    const results = await client.search(query)
    return mapResults(results, false)
  } catch (e) {
    winston.error(e.message)
    return undefined
  }
}

const fuzzySearch = async ({ search }, { size, from}) => {
  try {
    const fields = ['title^2', 'artists.name^10', 'tracks.title^0.5']

    const query = {
      index: discogsIndex,
      body: {
        from,
        size,
        query: {
          multi_match: {
            query: search,
            type: 'most_fields',
            fields
          }
        }
      }
    }

    winston.info('Elastic::discogs - query', JSON.stringify(query))
    const results = await client.search(query)
    return mapResults(results)
  } catch (e) {
    winston.error(e.message)
    return undefined
  }
}

const search = async ({ title, artist, label, catno }, { size, from}) => {
  try {
    const matches = []
    if (title) matches.push(matchBlock('title', title))
    if (artist) matches.push(matchBlock('artists.name', artist))
    if (label) matches.push(matchBlock('labels.name', label))
    if (catno) matches.push(matchBlock('labels.catno', catno))

    const query = {
      index: discogsIndex,
      body: {
        from,
        size,
        query: {
          bool: {
            must: matches
          }
        }
      }
    }

    winston.info('Elastic::discogs - query', JSON.stringify(query))
    const results = await client.search(query)
    return mapResults(results)
  } catch (e) {
    winston.error(e.message)
    return undefined
  }
}

const matchBlock = (key, value) => {
  return {
    match: {
      [key]: value,
    }
  }
}

const mapResults = (results, array = true) => {
  const mappedResults = results.hits.hits.map(item => {
    let response = item._source
    return response
  })

  if (!array) {
    return mappedResults[0]
  }

  return mappedResults
}

module.exports = {
  byReleaseId,
  search,
  fuzzySearch,
}
