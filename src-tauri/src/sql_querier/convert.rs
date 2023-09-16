use anyhow::{anyhow, Result};
use polars::prelude::*;
use sqlparser::ast::{
  BinaryOperator as SqlBinaryOperator, Expr as SqlExpr, Offset as SqlOffset, OrderByExpr, Select,
  SelectItem, SetExpr, Statement, TableFactor, TableWithJoins, Value as SqlValue,
};

/// parsed sql
pub struct Sql<'a> {
  pub(crate) selection: Vec<Expr>,
  pub(crate) condition: Option<Expr>,
  pub(crate) source: &'a str,
  pub(crate) order_by: Vec<(String, bool)>,
  pub(crate) offset: Option<i64>,
  pub(crate) limit: Option<usize>,
}

// due to the orphan rule of Rust trait, if we want to implement existing trait for pre-existing type
// we should simple wrap them
pub struct Expression(pub(crate) Box<SqlExpr>);
pub struct Operation(pub(crate) SqlBinaryOperator);
pub struct Projection<'a>(pub(crate) &'a SelectItem);
pub struct Source<'a>(pub(crate) &'a [TableWithJoins]);
pub struct Order<'a>(pub(crate) &'a OrderByExpr);
pub struct Offset<'a>(pub(crate) &'a SqlOffset);
pub struct Limit<'a>(pub(crate) &'a SqlExpr);
pub struct Value(pub(crate) SqlValue);

/// converting the SqlParser parsed `Statement` to we need structure
impl<'a> TryFrom<&'a Statement> for Sql<'a> {
  type Error = anyhow::Error;

  fn try_from(sql: &'a Statement) -> Result<Self, Self::Error> {
    match sql {
      // now, we only concern for query(select ... from ... where ...)
      Statement::Query(q) => {
        let offset = q.offset.as_ref();
        let limit = q.limit.as_ref();
        let orders = &q.order_by;
        let Select {
          from: table_with_joins,
          selection: where_clause,
          projection,
          group_by: _,
          ..
        } = match &q.body {
          SetExpr::Select(statement) => statement.as_ref(),
          _ => return Err(anyhow!("we only support Select Query at the moment")),
        };

        let source = Source(table_with_joins).try_into()?;

        let condition = match where_clause {
          Some(expr) => Some(Expression(Box::new(expr.to_owned())).try_into()?),
          None => None,
        };

        let mut selection = Vec::with_capacity(8);
        for p in projection {
          let expr = Projection(p).try_into()?;
          selection.push(expr);
        }

        let mut order_by = Vec::new();
        for expr in orders {
          order_by.push(Order(expr).try_into()?);
        }

        let offset = offset.map(|v| Offset(v).into());
        let limit = limit.map(|v| Limit(v).into());

        Ok(Sql {
          selection,
          condition,
          source,
          order_by,
          offset,
          limit,
        })
      }
      _ => Err(anyhow!("we only support Query at the moment")),
    }
  }
}

/// converts SqlParser's Expr to DataFrame's Expr
impl TryFrom<Expression> for Expr {
  type Error = anyhow::Error;

  fn try_from(expr: Expression) -> Result<Self, Self::Error> {
    match *expr.0 {
      SqlExpr::BinaryOp { left, op, right } => Ok(Expr::BinaryExpr {
        left: Box::new(Expression(left).try_into()?),
        op: Operation(op).try_into()?,
        right: Box::new(Expression(right).try_into()?),
      }),
      SqlExpr::Wildcard => Ok(Self::Wildcard),
      SqlExpr::IsNull(expr) => Ok(Self::IsNull(Box::new(Expression(expr).try_into()?))),
      SqlExpr::IsNotNull(expr) => Ok(Self::IsNotNull(Box::new(Expression(expr).try_into()?))),
      SqlExpr::Identifier(id) => Ok(Self::Column(Arc::new(id.value))),
      SqlExpr::Value(v) => Ok(Self::Literal(Value(v).try_into()?)),
      v => Err(anyhow!("")),
    }
  }
}

/// converts SqlParser's BinaryOperator to DataFrame's Operator
impl TryFrom<Operation> for Operator {
  type Error = anyhow::Error;

  fn try_from(op: Operation) -> Result<Self, Self::Error> {
    match op.0 {
      SqlBinaryOperator::Plus => Ok(Self::Plus),
      SqlBinaryOperator::Minus => Ok(Self::Minus),
      SqlBinaryOperator::Multiply => Ok(Self::Multiply),
      SqlBinaryOperator::Divide => Ok(Self::Divide),
      SqlBinaryOperator::Modulo => Ok(Self::Modulus),
      SqlBinaryOperator::Gt => Ok(Self::Gt),
      SqlBinaryOperator::Lt => Ok(Self::Lt),
      SqlBinaryOperator::GtEq => Ok(Self::GtEq),
      SqlBinaryOperator::LtEq => Ok(Self::LtEq),
      SqlBinaryOperator::Eq => Ok(Self::Eq),
      SqlBinaryOperator::NotEq => Ok(Self::NotEq),
      SqlBinaryOperator::And => Ok(Self::And),
      SqlBinaryOperator::Or => Ok(Self::Or),
      v => Err(anyhow!("Operator {} is not supported", v)),
    }
  }
}

/// converts SqlParser's SelectItem to DataFrame's Expr
impl<'a> TryFrom<Projection<'a>> for Expr {
  type Error = anyhow::Error;

  fn try_from(p: Projection<'a>) -> Result<Self, Self::Error> {
    match p.0 {
      SelectItem::UnnamedExpr(SqlExpr::Identifier(id)) => Ok(col(&id.to_string())),
      SelectItem::ExprWithAlias {
        expr: SqlExpr::Identifier(id),
        alias,
      } => Ok(Expr::Alias(
        Box::new(Expr::Column(Arc::new(id.to_string()))),
        Arc::new(alias.to_string()),
      )),
      SelectItem::QualifiedWildcard(v) => Ok(col(&v.to_string())),
      SelectItem::Wildcard => Ok(col("*")),
      item => Err(anyhow!("projection {} not supported", item)),
    }
  }
}

impl<'a> TryFrom<Source<'a>> for &'a str {
  type Error = anyhow::Error;

  fn try_from(source: Source<'a>) -> Result<Self, Self::Error> {
    if source.0.len() != 1 {
      return Err(anyhow!("we only support single data source now"));
    }

    let table = &source.0[0];

    if !table.joins.is_empty() {
      return Err(anyhow!("We do not support joint data source at the moment"));
    }

    match &table.relation {
      TableFactor::Table { name, .. } => Ok(&name.0.first().unwrap().value),
      _ => Err(anyhow!("we only support table")),
    }
  }
}

/// converts SqlParser's order by expr to (columnName, order method)
impl<'a> TryFrom<Order<'a>> for (String, bool) {
  type Error = anyhow::Error;

  fn try_from(o: Order) -> Result<Self, Self::Error> {
    let name = match &o.0.expr {
      SqlExpr::Identifier(id) => id.to_string(),
      expr => {
        return Err(anyhow!(
          "We only support identifier for order by, got {}",
          expr
        ))
      }
    };

    Ok((name, !o.0.asc.unwrap_or_else(|| true)))
  }
}

/// converts SqlParser's offset expr to i64
impl<'a> From<Offset<'a>> for i64 {
  fn from(offset: Offset<'a>) -> Self {
    match offset.0 {
      SqlOffset {
        value: SqlExpr::Value(SqlValue::Number(v, _b)),
        ..
      } => v.parse().unwrap_or(0),
      _ => 0,
    }
  }
}

/// converts SqlParser's Limit expr to usize
impl<'a> From<Limit<'a>> for usize {
  fn from(l: Limit<'a>) -> Self {
    match l.0 {
      SqlExpr::Value(SqlValue::Number(v, _b)) => v.parse().unwrap_or(usize::MAX),
      _ => usize::MAX,
    }
  }
}

impl TryFrom<Value> for LiteralValue {
  type Error = anyhow::Error;

  fn try_from(v: Value) -> Result<Self, Self::Error> {
    match v.0 {
      SqlValue::Number(v, _) => Ok(LiteralValue::Float64(v.parse().unwrap())),
      SqlValue::Boolean(v) => Ok(LiteralValue::Boolean(v)),
      SqlValue::Null => Ok(LiteralValue::Null),
      v => Err(anyhow!("Value {} is not supported", v)),
    }
  }
}
