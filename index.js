//Lily Su
//Dates are YYYY-MM-DD format

const { knex } = require("./connection");
const { ApolloServer, gql } = require("apollo-server");
const typeDefs = gql`
    # what the query will return
    type ExchangeInfo {
        countryA: String
        countryB: String
        startDate: String
        endDate: String
        exchangeDifference: Float
    }

    # user input 
    input exchangeInput{
        countryA: String
        countryB: String
        startDate: String
        endDate: String
    }

    type Query {
        exchange(input: exchangeInput): ExchangeInfo
    }
`;

const resolvers = {
    Query: {
        exchange: async (parent, args) => {
            const { countryA, countryB, startDate, endDate } = args.input;
            const avgRate = await getExchangeInfo(countryA, countryB, startDate, endDate)
            if (avgRate) {
                return{
                    countryA: countryA,
                    countryB: countryB,
                    startDate: startDate,
                    endDate: endDate,
                    exchangeDifference: (avgRate[0]-avgRate[1]).toFixed(4)
                };
            }
            else {
                throw new Error('Exchange information not found')
            }
        }
    },
};

const countriesReverse = ['australia', 'euro', 'ireland', 'new zealand', 'united kingdom']

//calculates exchange difference
//could optimize by reducing code reuse
const getExchangeInfo = async(countryA, countryB, startDate, endDate) => {
    try {
        let searchDb = 'daily'
        countryA=countryA.toLowerCase()
        countryB=countryB.toLowerCase()

        //checks if country is in the daily database
        let resA = await knex('daily').where('country', countryA)
        let resB = await knex('daily').where('country', countryB)
        
        //if one of the countries is not in the daily database search the monthly one
        if (resA.length === 0 || resB.length === 0){
            startDate=startDate.slice(0, 7)+'-01'
            endDate=endDate.slice(0, 7)+'-01'
            searchDb = 'monthly'
        }

        //gets the rows for each country in the specified time frame
        resA = await knex(searchDb).where((builder) =>
        builder
            .whereBetween('dated', [startDate, endDate])
            .where('country', countryA)
        )
        resB = await knex(searchDb).where((builder) =>
        builder
            .whereBetween('dated', [startDate, endDate])
            .where('country', countryB)
        )

        //adds up rates
        let avgRate = [0, 0];
        resA.forEach(row => {
            avgRate[0] += row.rate;
        })
        resB.forEach(row => {
            avgRate[1] += row.rate;
        })
        
        //calculates average, accounts for countries that store the ratio as USD/currency
        if (countriesReverse.includes(countryA)) avgRate[0] = resA.length/avgRate[0];
        else avgRate[0] /= resA.length;
        if (countriesReverse.includes(countryB)) avgRate[1] = resB.length/avgRate[1];
        else avgRate[1] /= resB.length;

        return avgRate
    }
    catch (error) {
        console.error("Error fetching exchange data: ", error);
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    });

server.listen().then(({ url }) => {
    console.log(` Server ready at: ${url}graphql`);
});
