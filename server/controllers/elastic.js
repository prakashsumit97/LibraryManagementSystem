var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});




exports.testElastic = async function(req, res) {
    // client.ping({
    //     // ping usually has a 3000ms timeout
    //     requestTimeout: 1000
    // }, function(error) {
    //     if (error) {
    //         console.trace('elasticsearch cluster is down!');
    //     } else {
    //         console.log('All is well');
    //     }
    // });
    try {
        const response = await client.search({
            q: 'pants'
        });
        console.log(response.hits.hits)
        res.send(response);
    } catch (error) {
        console.trace(error.message)
        res.send(response);
    }
}

exports.saveUser = async function(userData) {
    var indexRes = await checkIndexAlreadyExist('users');
    if (!indexRes) {
        var createIndexRes = await createNewIndex('users');
    }

    // const { count } = await client.count({ index: 'users' });
    // console.log("count", count);
    // if (!count) {
    //     let mappingRes = await initMapping();
    //     console.log('mappingRes', mappingRes);
    // }
    let newObj = Object.assign({}, userData)
    console.log('newObj', newObj);
    if (newObj._doc && newObj._doc._id) delete newObj._doc._id
    let docRes = await addDocument('users', userData.id, 'document', newObj._doc);
    console.log('docRes', docRes);
}


exports.getUsers = async function(paramsData) {
    return await client.search({
        index: 'users',
        type: 'document',
        body: {
            "query": {
                "match": {
                    "role": paramsData
                }
            }
        }
    }).then(function(resp) {
        return formatResponse(resp)
    }, function(err) {
        console.log(err.message);
        return err
    });

}

exports.getParticularUsers = async function(paramsData) {
    return await client.search({
        index: 'users',
        type: 'document',
        body: {
            "query": {
                "match": {
                    "_id": paramsData
                }
            }
        }
    }).then(function(resp) {
        return (formatResponse(resp))[0]
    }, function(err) {
        console.log(err.message);
        return err
    });

}

function formatResponse(response) {
    if ((((response || {}).hits || {}).hits || [])) {
        return response.hits.hits.map((item) => {
            item._source._id = item._id
            return item._source
        })
    } else {
        return response
    }
}
// function(req, res, indexName, docType, payload) {

// }

async function addDocument(indexName, _id, docType, payload) {
    return await client.index({
        index: indexName,
        type: docType,
        id: _id,
        body: payload
    }).then(function(resp) {
        // console.log(resp);
        return resp
    }, function(err) {
        // console.log(err.message);
        return err
    });
}

// default mapping
async function initMapping() {
    let payload = {
        "properties": {
            "role": { "type": "string" },
            "name": { "type": "string" },
            "userName": { "type": "string" },
            "email": { "type": "string" },
            "mobileNumber": { "type": "string" }
            // "suggest": {
            //     "type": "completion",
            //     "analyzer": "simple",
            //     "search_analyzer": "simple"
            // }
        }
        // "properties": {
        //     "title": { "type": "string" },
        //     "description": { "type": "string" },
        //     "tags": { "type": "string" },
        //     "suggest": {
        //         "type": "completion",
        //         "analyzer": "simple",
        //         "search_analyzer": "simple"
        //     }
        // }
    }

    return client.indices.putMapping({
        index: "users",
        type: "documents",
        body: {
            properties: {
                title: { "type": "string" },
                description: { "type": "string" },
                tags: { "type": "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple"
                }
            }
        }
    }).then(function(resp) {
        return resp
    }, function(err) {
        return err
    });
}

async function checkIndexAlreadyExist(indexName) {
    let response = await client.indices.exists({ index: indexName }).then(function(resp) {
        console.log('resp', resp);
        return resp;
    }, function(err) {
        console.log('err', err);
        return err;
    })
    return response;
}

async function createNewIndex(indexName) {
    let response = await client.indices.create({ index: indexName }).then(function(resp) {
        return resp;
    }, function(err) {
        return err;
    })
    return response;
}


// var elasticsearch = require('elasticsearch');
// var elasticClient = new elasticsearch.Client({
//     host: 'localhost:9200',
//     log: 'trace'
// });

// module.exports = {
//     ping: function(req, res) {
//         elasticClient.ping({
//             requestTimeout: 30000,
//         }, function(error) {
//             if (error) {
//                 res.status(500)
//                 return res.json({ status: false, msg: 'Elasticsearch cluster is down!' })
//             } else {
//                 res.status(200);
//                 return res.json({ status: true, msg: 'Success! Elasticsearch cluster is up!' })
//             }
//         });
//     },

//     // 1. Create index
//     initIndex: function(req, res, indexName) {

//         elasticClient.indices.create({
//             index: indexName
//         }).then(function(resp) {
//             // console.log(resp);
//             res.status(200)
//             return res.json(resp)
//         }, function(err) {
//             // console.log(err.message);
//             res.status(500)
//             return res.json(err)
//         });
//     },

//     // 2. Check if index exists
//     indexExists: function(req, res, indexName) {
//         elasticClient.indices.exists({
//             index: indexName
//         }).then(function(resp) {
//             // console.log(resp);
//             res.status(200);
//             return res.json(resp)
//         }, function(err) {
//             // console.log(err.message);
//             res.status(500)
//             return res.json(err)
//         });
//     },

//     // 3.  Preparing index and its mapping
//     initMapping: function(req, res, indexName, docType, payload) {

//         elasticClient.indices.putMapping({
//             index: indexName,
//             type: docType,
//             body: payload
//         }).then(function(resp) {
//             res.status(200);
//             return res.json(resp)
//         }, function(err) {
//             res.status(500)
//             return res.json(err)
//         });
//     },

//     // 4. Add/Update a document
//     addDocument: function(req, res, indexName, _id, docType, payload) {
//         elasticClient.index({
//             index: indexName,
//             type: docType,
//             id: _id,
//             body: payload
//         }).then(function(resp) {
//             // console.log(resp);
//             res.status(200);
//             return res.json(resp)
//         }, function(err) {
//             // console.log(err.message);
//             res.status(500)
//             return res.json(err)
//         });
//     },



//     // 5. Update a document
//     updateDocument: function(req, res, index, _id, docType, payload) {
//         elasticClient.update({
//             index: index,
//             type: docType,
//             id: _id,
//             body: payload
//         }, function(err, resp) {
//             if (err) return res.json(err);
//             return res.json(resp);
//         })
//     },

//     // 6. Search
//     search: function(req, res, indexName, docType, payload) {
//         elasticClient.search({
//             index: indexName,
//             type: docType,
//             body: payload
//         }).then(function(resp) {
//             console.log(resp);
//             return res.json(resp)
//         }, function(err) {
//             console.log(err.message);
//             return res.json(err.message)
//         });
//     },


//     /*
//      *	[xxxxxxxxxxxxxxxxx=-----  DANGER AREA [RESTRICTED USE] -----=xxxxxxxxxxxxxxxxxxxxx]
//      */

//     // Delete a document from an index
//     deleteDocument: function(req, res, index, _id, docType) {
//         elasticClient.delete({
//             index: index,
//             type: docType,
//             id: _id,
//         }, function(err, resp) {
//             if (err) return res.json(err);
//             return res.json(resp);
//         });
//     },

//     // Delete all
//     deleteAll: function(req, res) {
//         elasticClient.indices.delete({
//             index: '_all'
//         }, function(err, resp) {

//             if (err) {
//                 console.error(err.message);
//             } else {
//                 console.log('Indexes have been deleted!', resp);
//                 return res.json(resp)
//             }
//         });
//     },

//     // [xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx]
// };'