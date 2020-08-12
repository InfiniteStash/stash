package models

import (
	"database/sql"

	"github.com/jmoiron/sqlx"
	"github.com/stashapp/stash/pkg/database"
)

const stashBoxInstancesTable = "stash_box_instances"

type StashBoxInstanceQueryBuilder struct{}

func NewStashBoxInstanceQueryBuilder() StashBoxInstanceQueryBuilder {
	return StashBoxInstanceQueryBuilder{}
}

func (qb *StashBoxInstanceQueryBuilder) Create(instance StashBoxInstance, tx *sqlx.Tx) (*StashBoxInstance, error) {
	ensureTx(tx)
	result, err := tx.NamedExec(
		`INSERT INTO stash_box_instances (endpoint, api_key)
				VALUES (:endpoint, :api_key)
		`,
		instance,
	)
	if err != nil {
		return nil, err
	}
	instanceID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	if err := tx.Get(&instance, `SELECT * FROM stash_box_instances WHERE id = ? LIMIT 1`, instanceID); err != nil {
		return nil, err
	}

	return &instance, nil
}

func (qb *StashBoxInstanceQueryBuilder) Update(updatedInstance StashBoxInstance, tx *sqlx.Tx) (*StashBoxInstance, error) {
	ensureTx(tx)
	query := `UPDATE stash_box_instances SET ` + SQLGenKeys(updatedInstance) + ` WHERE stash_box_instances.id = :id`
	_, err := tx.NamedExec(
		query,
		updatedInstance,
	)
	if err != nil {
		return nil, err
	}

	if err := tx.Get(&updatedInstance, `SELECT * FROM stash_box_instances WHERE id = ? LIMIT 1`, updatedInstance.ID); err != nil {
		return nil, err
	}
	return &updatedInstance, nil
}

func (qb *StashBoxInstanceQueryBuilder) Destroy(id string, tx *sqlx.Tx) error {
	return executeDeleteQuery("stash_box_instances", id, tx)
}

func (qb *StashBoxInstanceQueryBuilder) All() ([]*StashBoxInstance, error) {
	var rows *sqlx.Rows
	var err error
  rows, err = database.DB.Queryx(selectAll("stash_box_instances"))

	if err != nil && err != sql.ErrNoRows {
		return nil, err
	}
	defer rows.Close()

	instances := make([]*StashBoxInstance, 0)
	for rows.Next() {
		instance := StashBoxInstance{}
		if err := rows.StructScan(&instance); err != nil {
			return nil, err
		}
		instances = append(instances, &instance)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return instances, nil
}
