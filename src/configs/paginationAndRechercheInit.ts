import { myDataSource } from "./data-source";

export function paginationAndRechercheInit(req, table){
    //initiation pour la pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const searchTerm = req.query.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));

        // get fields of entity that have a ManyToOne relation
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name !== 'User')
        .reduce((result, relation) => {
            const relatedTableName = relation.inverseEntityMetadata.name;
            const rrelationFields = relation.inverseEntityMetadata.relations.flatMap(rel => rel.joinColumns.map(column => `${relatedTableName}.${column.propertyName}`));
            
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${relatedTableName}.${column.propertyName}`)
                .filter(field => !rrelationFields.includes(field));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);
        //

        // trie des champs
        const excludedStrings = ['createdAt', 'updatedAt', 'deletedAt', 'userCreation','abonneCreation'];
        searchQueries = fields
            .filter(field => {
                const fieldParts = field.split('.');
                const lastPart = fieldParts[fieldParts.length - 1];
                return !excludedStrings.includes(lastPart);
            })
            .map(field =>  {
            return `${field} LIKE :keyword`; 
        });
    }

    return { page, limit, searchTerm, startIndex, searchQueries };
}

export function paginationAndRechercheInit2(req, table){

    //initiation pour la pagination
    const page = parseInt(req.body.page as string) || 1;
    const limit = parseInt(req.body.limit as string) || 10;
    const searchTerm = req.body.mot as string || '';
    const startIndex = (page - 1) * limit;
    let searchQueries = [];

    if(searchTerm != '') { 
        // get fields of entity
        const entityRepository = myDataSource.getRepository(table);
        const tableName = entityRepository.metadata.tableName;
        const relationFields = entityRepository.metadata.relations.flatMap(relation => relation.joinColumns.map(column => `${tableName}.${column.propertyName}`));
        const currentFields = entityRepository.metadata.columns.map(column => `${tableName}.${column.propertyName}`).filter(field => !relationFields.includes(field));
        

        // get fields of entity that have a ManyToOne relation
        const relations = entityRepository.metadata.relations;
        const manyToOneRelationsAndEntities = relations
        .filter(relation => relation.isManyToOne && relation.inverseEntityMetadata.name !== 'User')
        .reduce((result, relation) => {
            const relatedTableName = relation.inverseEntityMetadata.name;
            const rrelationFields = relation.inverseEntityMetadata.relations.flatMap(rel => rel.joinColumns.map(column => `${relatedTableName}.${column.propertyName}`));
            const relatedTableColumns = relation.inverseEntityMetadata.columns
                .map(column => `${relatedTableName}.${column.propertyName}`)
                .filter(field => !rrelationFields.includes(field));
            result[relatedTableName] = (result[relatedTableName] || []).concat(relatedTableColumns);
            return result;
        }, {});
        
        // merge all fields
        const allFields = Object.values(manyToOneRelationsAndEntities).flat() as string[];
        const fields = currentFields.concat(allFields);

        // trie des champs
        const excludedStrings = ['createdAt', 'updatedAt', 'deletedAt', 'userCreation','abonneCreation'];
        searchQueries = fields
            .filter(field => {
                const fieldParts = field.split('.');
                const lastPart = fieldParts[fieldParts.length - 1];
                return !excludedStrings.includes(lastPart);
            })
            .map(field =>  {
            return `${field} LIKE :keyword`; 
        });
    }


    return { page, limit, searchTerm, startIndex, searchQueries };
}