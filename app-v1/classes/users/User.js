// Domain entity: plain user aggregate representation (no I/O here)
class UserEntity {
  constructor(props = {}) {
    this.id = props.id ?? null;
    this.username = props.username ?? null;
    this.full_name = props.full_name ?? null;
    this.email = props.email ?? null;
    this.role = props.role ?? null;
    this.status = props.status ?? null;
    this.last_login = props.last_login ?? null;
    this.email_verified_at = props.email_verified_at ?? null;
  }
}

module.exports = UserEntity;
