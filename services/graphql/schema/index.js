const { makeExecutableSchema } = require('graphql-tools');
const resolvers = require('./resolvers');

const typeDefs = `
  type Release {
    id: Int!
    title: String
    country: String
    released: String
    released_year: String
    released_month: String
    released_day: String
    notes: String
    data_quality: String
    master_id: String
    ean: String
    genres: [String]
    styles: [String]
    identifiers: [Identifier]
    main_artist: Artist
    artists: [Artist]
    extraartists: [Artist]
    labels: [Label]
    tracks: [Track]
    formats: [Format]
    companies: [Company]
    boguses: [String]
  }
  type Genre {
    name: String
  }
  type Style {
    name: String
  }
  type Identifier {
    type: String
    value: String
  }
  type Artist {
    id: Int
    name: String
    anv: String
    join: String
    role: String
  }
  type Label {
    original_catno: String
    catno: String
    name: String
  }
  type Track {
    position: String
    title: String
    duration: String
  }
  type Format {
    descriptions: [String]
    text: String
    name: String
    qty: String
  }
  type Company {
    id: Int
    name: String
    entity_type: String
    entity_type_name: String
  }

  type Query {
    byReleaseId(releaseId: Int!): Release
    fuzzySearch(
      search: String = "",
      from: Int = 0,
      size: Int = 25
    ): [Release]
    search(
      title: String = "",
      artist: String = "",
      from: Int = 0,
      size: Int = 25
    ): [Release]
  }
`;

module.exports = makeExecutableSchema({ typeDefs, resolvers });
