const common = require("../helper/common");

class dataQuery {
    include = [];
    where = {};
    order = [];
    attributes = {}
    constructor(where = {}, include = [], order = [], attributes = {}) {
        this.order = order;
        this.include = include;
        this.where = where;
        this.attributes = attributes;
    }

    async getQuery() {
        return {
            include: this.include,
            where: this.where,
        }
    }
}

class BaseRepository {
    limit = null;
    items = [];

    paginationRecord() {
        const req = global.currentRequest;
        this.currentPage = parseInt(req.query && req.query.page ? parseInt(req.query.page) : 1);
        this.totalRecords = req.query && req.query.total ? parseInt(req.query.total) : null;
        this.offset = (this.currentPage - 1) * this.limit;

        this.limit = req.query.limit ? req.query.limit : this.limit;
        if (this.limit == 0) {
            this.limit = null
        }
    }
    constructor() {
        // const req = global.currentRequest;
        // this.currentPage = parseInt(req.query && req.query.page ? parseInt(req.query.page) : 1);
        // this.totalRecords = req.query && req.query.total ? parseInt(req.query.total) : null;
        // this.offset = (this.currentPage - 1) * this.limit;

        this.paginationRecord();
    }

    async getData(dataModel, dQuery) {
        this.paginationRecord();
        let paginationInfo = null;
        let data = {};
         // Ensure dQuery.where is initialized
        dQuery.where = dQuery.where || {};
        
        if (this.limit) {
            if (this.currentPage == 1) {
                this.totalRecords = await dataModel.count({
                    include: dQuery.include,
                    where: dQuery.where,
                    distinct: true,
                    col: 'id', 
                    subQuery: false
                });
            }
            data = await dataModel.findAll({
                include: dQuery.include,
                where: dQuery.where,
                order: dQuery.order,
                attributes : dQuery.attributes,
                limit: this.limit,
                offset: this.offset,
                subQuery: dQuery.subQuery ?? true,
                paranoid: true,
            });
            paginationInfo = await this.getPagination(this.totalRecords);

        } else {
            data = await dataModel.findAll({
                include: dQuery.include,
                where: dQuery.where,
                attributes : dQuery.attributes,
                order: dQuery.order,
                paranoid: true
            });
        }
        return {
            items: data,
            pagination: paginationInfo,
        };
    }

    async findOne(dataModel, dQuery) {

        dQuery.where = dQuery.where || {};

        return await dataModel.findOne({
            include: dQuery.include,
            attributes : dQuery.attributes,
            where: dQuery.where
        });
    }

    async getPagination(totalRecords) {
        if (!this.limit) return null;
        const req = global.currentRequest;
        const baseUrl = global.baseUrl;
        const currentPage = parseInt(req.query && req.query.page ? req.query.page : 1);
        const total = totalRecords || 0;
        const totalPages = Math.ceil(total / this.limit);

        const prevPage = currentPage > 1 ? `${baseUrl}?page=${(currentPage - 1)}&total=${total}` : null;
        const nextPage = currentPage < totalPages ? `${baseUrl}?page=${(currentPage + 1)}&total=${total}` : null;
        const firstPage = `${baseUrl}?page=1&total=${total}`;
        const lastPage = `${baseUrl}?page=${totalPages}&total=${total}`;

        return {
            current_page: currentPage,
            total_pages: totalPages,
            first_page: firstPage,
            prev_page: prevPage,
            next_page: nextPage,
            last_page: lastPage,
            totalItems: total,
        };
    }
    async destroy(dataModel, dQuery) {
        return await dataModel.findOne({
            where: dQuery.where
        });
    }
}

module.exports = {
    BaseRepository,
    dataQuery
};