package DailyTaskService

import (
	"context"

	"github.com/go-pg/pg/v10"
)

type DataStore interface {
	Model(model interface{}) QueryRunner
	WithContext(ctx context.Context) DataStore
}

type QueryRunner interface {
	Where(query string, params ...interface{}) QueryRunner
	Select() (err error)
	Insert() (res pg.Result, err error)
	Set(query string, params ...interface{}) QueryRunner
	WherePK() QueryRunner
	Update() (res pg.Result, err error)
	Delete() (res pg.Result, err error)
}

type PGDataStore struct {
	DB *pg.DB
}

func (p *PGDataStore) Model(model interface{}) QueryRunner {
	newModel := p.DB.Model(model)
	return &PGQueryRunner{query: newModel}
}

func (p *PGDataStore) WithContext(ctx context.Context) DataStore {
	newDS := p.DB.WithContext(ctx)
	return &PGDataStore{DB: newDS}
}

type PGQueryRunner struct {
	query *pg.Query
}

func (q *PGQueryRunner) Where(query string, params ...interface{}) QueryRunner {
	newQuery := q.query.Where(query, params...)
	return &PGQueryRunner{query: newQuery}
}

func (q *PGQueryRunner) Delete() (pg.Result, error) {
	res, err := q.query.Delete()
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (q *PGQueryRunner) Insert() (pg.Result, error) {
	res, err := q.query.Insert()
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (q *PGQueryRunner) Select() error {
	return q.query.Select()
}

func (q *PGQueryRunner) Set(query string, params ...interface{}) QueryRunner {
	newQuery := q.query.Set(query, params...)
	return &PGQueryRunner{query: newQuery}
}

func (q *PGQueryRunner) Update() (pg.Result, error) {
	res, err := q.query.Update()
	if err != nil {
		return nil, err
	}
	return res, nil
}

func (q *PGQueryRunner) WherePK() QueryRunner {
	pk := q.query.WherePK()
	return &PGQueryRunner{query: pk}
}
