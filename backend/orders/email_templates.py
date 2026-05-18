"""Responsive HTML email templates for order lifecycle."""

SUPPORT_EMAIL = "muhammedsiddique240@gmail.com"
SUPPORT_PHONE = "+923496230820"


def _base_template(title: str, subtitle: str, body_html: str) -> str:
    return f"""
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f6f6;font-family:Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f6f6;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #ececec;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px;border-bottom:1px solid #f0f0f0;">
                <h1 style="margin:0;font-size:24px;line-height:1.2;color:#111;">SWAG <span style="color:#ff5a1f;">SHOES</span></h1>
                <p style="margin:6px 0 0;font-size:13px;color:#666;">{subtitle}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                {body_html}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;background:#fafafa;border-top:1px solid #f0f0f0;">
                <p style="margin:0;font-size:12px;color:#666;">Need help? Contact us at <a href="mailto:{SUPPORT_EMAIL}" style="color:#111;">{SUPPORT_EMAIL}</a> or WhatsApp <a href="tel:{SUPPORT_PHONE}" style="color:#111;">{SUPPORT_PHONE}</a>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def order_placed_template(customer_name: str, order_id: str, product_title: str) -> str:
    return _base_template(
        "Order placed",
        "Thanks for your order! We are verifying your details.",
        f"""
<h2 style="margin:0 0 14px;font-size:20px;">Thanks for your order, {customer_name}!</h2>
<p style="margin:0 0 10px;font-size:14px;color:#444;">We are verifying your details and preparing your pair.</p>
<p style="margin:0;font-size:14px;color:#444;"><strong>Order ID:</strong> {order_id}<br/><strong>Product:</strong> {product_title}</p>
""",
    )


def order_shipped_template(customer_name: str, order_id: str, product_title: str, tracking_details: str) -> str:
    return _base_template(
        "Order shipped",
        "Your Swag Shoes are on the way! Here are your tracking details.",
        f"""
<h2 style="margin:0 0 14px;font-size:20px;">Your order is on the way, {customer_name}!</h2>
<p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Order ID:</strong> {order_id}</p>
<p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Product:</strong> {product_title}</p>
<p style="margin:0;font-size:14px;color:#444;"><strong>Tracking details:</strong> {tracking_details}</p>
""",
    )


def order_delivered_template(customer_name: str, order_id: str, product_title: str) -> str:
    return _base_template(
        "Order delivered",
        "Enjoy your kicks! Leave us a review.",
        f"""
<h2 style="margin:0 0 14px;font-size:20px;">Delivered successfully, {customer_name}!</h2>
<p style="margin:0 0 10px;font-size:14px;color:#444;">Your pair has been delivered.</p>
<p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Order ID:</strong> {order_id}</p>
<p style="margin:0;font-size:14px;color:#444;"><strong>Product:</strong> {product_title}</p>
""",
    )


def order_canceled_template(customer_name: str, order_id: str, product_title: str) -> str:
    return _base_template(
        "Order canceled",
        "Your order has been canceled. Contact support if this was a mistake.",
        f"""
<h2 style="margin:0 0 14px;font-size:20px;">Order canceled, {customer_name}</h2>
<p style="margin:0 0 10px;font-size:14px;color:#444;">Your order was canceled. If this was a mistake, contact support and we will assist you right away.</p>
<p style="margin:0 0 10px;font-size:14px;color:#444;"><strong>Order ID:</strong> {order_id}</p>
<p style="margin:0;font-size:14px;color:#444;"><strong>Product:</strong> {product_title}</p>
""",
    )
