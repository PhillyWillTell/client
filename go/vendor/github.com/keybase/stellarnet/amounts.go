package stellarnet

import (
	"fmt"
	"math"
	"math/big"
	"regexp"

	"github.com/pkg/errors"
	samount "github.com/stellar/go/amount"
)

// Alow "-1", "1.", ".1", "1.1".
// But not "." or "".
var decimalStrictRE = regexp.MustCompile(`^-?((\d+\.?\d*)|(\d*\.?\d+))$`)

// parseDecimalStrict parses a decimal number into a big rational.
// Used instead of big.Rat.SetString because the latter accepts
// additional formats like "1/2" and "1e10".
func ParseDecimalStrict(s string) (*big.Rat, error) {
	if s == "" {
		return nil, fmt.Errorf("expected decimal number but found empty string")
	}
	if !decimalStrictRE.MatchString(s) {
		return nil, fmt.Errorf("expected decimal number: %s", s)
	}
	v, ok := new(big.Rat).SetString(s)
	if !ok {
		return nil, fmt.Errorf("expected decimal number: %s", s)
	}
	return v, nil
}

// ConvertXLMToOutside converts an amount of lumens into an amount of outside currency.
// `rate` is the amount of outside currency that 1 XLM is worth. Example: "0.9389014463" = PLN / XLM
// The result is rounded to 7 digits past the decimal.
// The rounding is arbitrary but expected to be sufficient precision.
func ConvertXLMToOutside(XLMAmount, rate string) (outsideAmount string, err error) {
	rateRat, err := parseExchangeRate(rate)
	if err != nil {
		return "", err
	}
	amountInt64, err := samount.ParseInt64(XLMAmount)
	if err != nil {
		return "", fmt.Errorf("parsing amount to convert: %q", err)
	}
	acc := big.NewRat(amountInt64, samount.One)
	acc.Mul(acc, rateRat)
	return acc.FloatString(7), nil
}

// ConvertOutsideToXLM converts an amount of outside currency into an amount of lumens.
// `rate` is the amount of outside currency that 1 XLM is worth. Example: "0.9389014463" = PLN / XLM
// The result is rounded to 7 digits past the decimal (which is what XLM supports).
// The result returned can of a greater magnitude than XLM supports.
func ConvertOutsideToXLM(outsideAmount, rate string) (XLMAmount string, err error) {
	rateRat, err := parseExchangeRate(rate)
	if err != nil {
		return "", err
	}
	acc, err := ParseDecimalStrict(outsideAmount)
	if err != nil {
		return "", fmt.Errorf("parsing amount to convert: %q", outsideAmount)
	}
	acc.Quo(acc, rateRat)
	return acc.FloatString(7), nil
}

// CompareStellarAmounts compares amounts of stellar assets.
// Returns:
//
//   -1 if x <  y
//    0 if x == y
//   +1 if x >  y
//
func CompareStellarAmounts(amount1, amount2 string) (int, error) {
	amountx, err := samount.ParseInt64(amount1)
	if err != nil {
		return 0, err
	}
	amounty, err := samount.ParseInt64(amount2)
	if err != nil {
		return 0, err
	}
	switch {
	case amountx < amounty:
		return -1, nil
	case amountx > amounty:
		return 1, nil
	default:
		return 0, nil
	}
}

// Return whether two amounts are within a factor of `maxFactor` of each other.
// For example maxFactor="0.01" returns whether they are within 1% of each other.
// <- (abs((a - b) / a) < fac) || (abs((a - b) / b < fac)
func WithinFactorStellarAmounts(amount1, amount2, maxFactor string) (bool, error) {
	a, err := samount.ParseInt64(amount1)
	if err != nil {
		return false, err
	}
	b, err := samount.ParseInt64(amount2)
	if err != nil {
		return false, err
	}
	fac, err := ParseDecimalStrict(maxFactor)
	if err != nil {
		return false, fmt.Errorf("error parsing factor: %q %v", maxFactor, err)
	}
	if fac.Sign() < 0 {
		return false, fmt.Errorf("negative factor: %q", maxFactor)
	}
	if a == 0 && b == 0 {
		return true, nil
	}
	if a == 0 || b == 0 {
		return false, nil
	}
	// BigRat method signatures are bizarre. This does not do what it looks like.
	left := big.NewRat(a, samount.One)
	left.Sub(left, big.NewRat(b, samount.One))
	right := big.NewRat(1, 1)
	right.Set(left)
	left.Quo(left, big.NewRat(a, samount.One))
	right.Quo(right, big.NewRat(b, samount.One))
	left.Abs(left)
	right.Abs(right)
	return (left.Cmp(fac) < 1) || (right.Cmp(fac) < 1), nil
}

func percentageAmountChange(a, b int64) float64 {
	if a == 0 && b == 0 {
		return 0.0
	}
	mid := 0.5 * float64(a+b)
	return math.Abs(100.0 * float64(a-b) / mid)
}

func parseExchangeRate(rate string) (*big.Rat, error) {
	rateRat, err := ParseDecimalStrict(rate)
	if err != nil {
		return nil, fmt.Errorf("error parsing exchange rate: %q", rate)
	}
	sign := rateRat.Sign()
	switch sign {
	case 1:
		return rateRat, nil
	case 0:
		return nil, errors.New("zero-value exchange rate")
	case -1:
		return nil, errors.New("negative exchange rate")
	default:
		return nil, fmt.Errorf("exchange rate of unknown sign (%v)", sign)
	}
}
