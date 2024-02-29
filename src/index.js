//Lily Su
//Dates are YYYY-MM-DD format
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

import { GraphQLError } from "graphql";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { knex } from "./connection.js";
const moment = require('moment')

const typeDefs = `#graphql
    type ExchangeInfo {
        from: String!
        to: String!
        startDate: String!
        endDate: String!
        exchangeDifference: Float!
    }

    input exchangeInput{
        from: String!
        to: String!
        startDate: String!
        endDate: String!
    }

    type Query {
        getExchangeRate(input: exchangeInput): ExchangeInfo
    }
`;

//What the query actually does
//Returns what the user entered and the exchange rate
const resolvers = {
    Query: {
        getExchangeRate: async (_, args) => {
            let { from, to, startDate, endDate } = args.input;

            const countriesReverse = ['australia', 'euro', 'ireland', 'new zealand', 'united kingdom']
            const countryPath = [from, to]
            let searchDb = 'daily'
            let avgRate = [0, 0];
            let index = 0;

            from=from.toLowerCase()
            to=to.toLowerCase()
            
            let resA = await knex('monthly').where('country', from);
            let resB = await knex('monthly').where('country', to);
            
            //argument error checking
            if (!(moment(startDate, 'YYYY-MM-DD', true).isValid())){
                throw new GraphQLError(`Date ${startDate} is not a valid date`, {
                    extensions: {
                        code: 'INVALID_DATE',
                    },})}
            if (!(moment(endDate, 'YYYY-MM-DD', true).isValid())){
                throw new GraphQLError(`Date ${endDate} is not a valid date`, {
                    extensions: {
                        code: 'INVALID_DATE',
                    },})}
            if (resA.length === 0){
                throw new GraphQLError(`Country ${from} does not exist`, {
                    extensions: {
                        code: 'COUNTRY_NOT_FOUND',
                    },})}
            if (resB.length === 0){
                throw new GraphQLError(`Country ${to} does not exist`, {
                    extensions: {
                        code: 'COUNTRY_NOT_FOUND',
                    },})}

            //if one of the countries is not in the daily database search the monthly one
            resA = await knex('daily').where('country', from)
            resB = await knex('daily').where('country', to)
            
            if (resA.length === 0 || resB.length === 0){
                startDate=startDate.slice(0, 7)+'-01'
                endDate=endDate.slice(0, 7)+'-01'
                searchDb = 'monthly'
            }

            //finds average exchange rate for both countries
            for (const country of countryPath){
                let res = await knex(searchDb).where((builder) =>
                builder
                    .whereBetween('dated', [startDate, endDate])
                    .where('country', country))

                if (res.length === 0){
                    throw new GraphQLError(`Country ${country} does not have an entry at that time`, {
                        extensions: {
                            code: 'COUNTRY_NOT_LOGGED',
                        },})}
                
                res.forEach(row => {
                    avgRate[index] += row.rate;})

                //accounts for countries that use USD/currency ratio
                if (countriesReverse.includes(country)) avgRate[index] = res.length/avgRate[index];
                else avgRate[index] /= res.length;
                
                index++
            }

            avgRate=(avgRate[0]-avgRate[1]).toFixed(4)
            return{
                from: from,
                to: to,
                startDate: startDate,
                endDate: endDate,
                exchangeDifference: avgRate
            };
        }
    },
};

//Apollo server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    });

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(` Server ready at: ${url}graphql`);