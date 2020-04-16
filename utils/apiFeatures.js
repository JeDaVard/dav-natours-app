class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        const queryObj = { ...this.queryString };
        const exclFields = ['page', 'sort', 'limit', 'fields'];
        for (let prop in this.queryString) {
            if (exclFields.includes(prop)) delete queryObj[prop];
        }

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }
    sort() {
        if (this.queryString.sort){
            this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }
    fieldLimit() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }
    paginate() {//model) {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 6;
        let skip = (page - 1) * limit

        //this was a pagination config but the algorithm I invented I didn't like, so. // :)
        // if (this.queryString.page) {
        //     const allTours = model.then(count => count).catch(e => e);
        //     console.log('a', allTours, 'a')
        //     if (skip >= allTours) {
        //         skip = allTours - limit
        //     }
        // }
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures