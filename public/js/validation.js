/**
 * validation.js
 * function： form validation
 **/

'use strict';

$(function () {
  // 会員登録フォームの送信イベントを取得
  $('#registForm').submit(function (e) {
    // 各入力フィールドの値を取得
    const customername = $("#customername").val() ?? null;
    const customermail = $("#customermail").val() ?? null;
    const content = $("#content").val() ?? null;

    // 名前チェック
    if (!customername || customername.length > 50) {
      alert("名前を正しく入力してください。");
      e.preventDefault();
      return;
    }

    // メールアドレスチェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customermail || !customermail.match(emailRegex)) {
      alert("メールの形式が正しくありません。");
      e.preventDefault();
      return;
    }

    // お問い合わせ内容チェック
    if (!content || content.length > 5000) {
      alert("お問い合わせ内容を正しく入力してください。");
      e.preventDefault();
      return;
    }

    // ダブルクリック回避
    preventdefault(e);
  });
});